using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class MessageController : BaseController
	{
		private CustomerDatabasesDbContext _customerDatabasesDbContext;
		private FuneralCallDbContext       _funeralCallDbContext;
		
		public MessageController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, CustomerDatabasesDbContext customerDatabasesDbContext, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_customerDatabasesDbContext = customerDatabasesDbContext;
			_funeralCallDbContext       = funeralCallDbContext;
		}
		
		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			Client      client  = null;
			MessageData message = null;
			
			// For client users, only allow their results to be returned ...
			if( ClientUserContext != null )
			{
				client = _funeralCallDbContext.Client.SingleOrDefault( cu => cu.id == ClientUserContext.client_id );
			}

			if( client != null )
			{
				message = _customerDatabasesDbContext.MessageData.SingleOrDefault( m => m.AcctNum.Trim() == client.account_number && m.msgID == id );
			}
			else
			{
				message = _customerDatabasesDbContext.MessageData.SingleOrDefault( m => m.msgID == id );
			}

			if( message == null )
			{
				return ApiResponseHandler.HandleError( Message.RecordNotFound.Value );
			}
			
			// Mark message read ...
			message.IsRead = "Y";

			_customerDatabasesDbContext.MessageData.Update( message );
			_customerDatabasesDbContext.SaveChanges();

			return GetRecord( formatMessageData( message ) );
		}

		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			var                            queryable                 = _customerDatabasesDbContext.MessageData.AsQueryable();
			List<ClientUserDeletedMessage> clientUserDeletedMessages = null;
			int                            messageCount              =  0;

			if( search == null )
			{
				search = new Search();
			}

			if( ( search.order_by == null ) || ( search.order_by.Length == 0 ) )
			{
				search.order_by = new string[] { "msgID desc" };
			}

			// For client users, only allow their results to be returned ...
			if( ClientUserContext != null )
			{
				List<string> columnsList  = new List<string>();
				List<string> searchList   = new List<string>();
				Client       client       = _funeralCallDbContext.Client.SingleOrDefault( cu => cu.id == ClientUserContext.client_id );
				
				messageCount = _customerDatabasesDbContext.MessageData.Count( m => m.AcctNum == client.account_number.Trim() && m.IsRead != "Y" );

				if( search.columns != null )
				{
					columnsList.AddRange( search.columns );
				}

				if( search.search != null )
				{
					searchList.AddRange( search.search );
				}

				columnsList.Add( "AcctNum" );
				searchList.Add( client.account_number.Trim() );

				search.columns            = columnsList.ToArray();
				search.search             = searchList.ToArray();
				search.exact_match_search = true;
				
				// Get deleted messages, if any ...
				clientUserDeletedMessages = _funeralCallDbContext.ClientUserDeletedMessage.Where( cudm => cudm.client_user_id == ClientUserContext.id.Value ).ToList();
			}
			
			PagedResult       result       = QueryBuilderPagedResult( queryable, search );
			var               messages     = result.Queryable.ToDynamicList<MessageData>();
			List<MessageData> results      = new List<MessageData>();

			foreach( var messageData in messages )
			{
				if( clientUserDeletedMessages != null )
				{
					ClientUserDeletedMessage clientUserDeletedMessage = clientUserDeletedMessages.Find( cudm => cudm.message_id == messageData.msgID );

					// Do no return deleted messages ...
					if( clientUserDeletedMessage != null )
					{
						continue;
					}
				}
				
				results.Add( formatMessageData( messageData ) );
			}

			return ApiResponseHandler.HandleSuccess( new
			                                         {
				                                         results,
				                                         currentPage		= result.CurrentPage,
				                                         pageSize			= result.PageSize,
				                                         rowCount			= result.RowCount,
				                                         unreadMessageCount	= messageCount
			                                         } );
		}

		[Authorize]
		[HttpPost]
		[Route( "markMessagesRead" )]
		public IActionResult MarkMessagesRead( [FromBody] JArray request )
		{
			if( request.HasValues == false )
			{
				return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
			}
			
			foreach( var msgID in request )
			{
				int id = Utilities.JsonToType<int>( msgID, -99 );
				
				MessageData messageData = _customerDatabasesDbContext.MessageData.SingleOrDefault( m => m.msgID == id );

				if( messageData != null )
				{
					messageData.IsRead = "Y";

					_customerDatabasesDbContext.MessageData.Update( messageData );
					_customerDatabasesDbContext.SaveChanges();
				}
			}
			
			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}

		[Authorize]
		[HttpPost]
		[Route( "deleteMessages" )]
		public IActionResult DeleteMessages( [FromBody] JArray request )
		{
			if( request.HasValues == false )
			{
				return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
			}

			// Only client users can delete their own messages ...
			if( ClientUserContext == null )
			{
				return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
			}

			foreach ( var msgID in request )
			{
				int                      id                       = Utilities.JsonToType<int>( msgID, -99 );
				ClientUserDeletedMessage clientUserDeletedMessage = new ClientUserDeletedMessage();

				clientUserDeletedMessage.client_user_id = ClientUserContext.id.Value;
				clientUserDeletedMessage.message_id     = id;

				_funeralCallDbContext.ClientUserDeletedMessage.Add( clientUserDeletedMessage );
				_funeralCallDbContext.SaveChanges();
			}
			
			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}

		[Authorize]
		[HttpPost]
		[Route( "confirmMessage" )]
		public IActionResult ConfirmMessage( [FromBody] JObject request )
		{
			int         msgID                = Utilities.JsonToType<int>( request["msgID"], -99 );
			string      messageResponseField = Utilities.JsonToType<string>( request["messageResponseField"], null );
			MessageData messageData          = _customerDatabasesDbContext.MessageData.SingleOrDefault( md => md.msgID == msgID );
			DateTime    now                  = DateTime.UtcNow;

			if( messageData == null )
			{
				return ApiResponseHandler.HandleError( Message.RecordNotFound.Value );
			}

			messageData.MessageConfirmed = "Yes";
			messageData.IsRead           = "Y";

			if( ( messageResponseField != null ) && ( messageResponseField.Length > 0 ) )
			{
				messageData.MessageResponseField = messageResponseField;
			}

			if( messageData.ConfirmedTime == null )
			{
				messageData.ConfirmedTime = now.ToString( "M/d/yyyy h:mm tt" );
			}
			else
			{
				messageData.ConfirmedTimeUpdated = now.ToString( "M/d/yyyy h:mm tt" );
			}

			if( ClientUserContext != null )
			{
				messageData.ConfirmedBy = String.Format( "{0} {1}", ClientUserContext.first_name, ClientUserContext.last_name );
			}

			_customerDatabasesDbContext.MessageData.Update( messageData );
			_customerDatabasesDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}
		
		/* Private Methods */
		private MessageData formatMessageData( MessageData messageData )
		{
			// Trim Data
			messageData.AcctNum         = Utilities.StringSafeTrim( messageData.AcctNum );
            messageData.AltPhone        = Utilities.StringSafeTrim( messageData.AltPhone );
            messageData.Ext             = Utilities.StringSafeTrim( messageData.Ext );
            messageData.IsDeathCall     = Utilities.StringSafeTrim( messageData.IsDeathCall );
            messageData.Notes           = Utilities.StringSafeTrim( messageData.Notes );
            messageData.CallerFirstName = Utilities.StringSafeTrim( messageData.CallerFirstName );
            messageData.CallerLastName  = Utilities.StringSafeTrim( messageData.CallerLastName );
            messageData.CallerID        = Utilities.StringSafeTrim( messageData.CallerID );
            
            // Build the full name
            string caller_name = "";
            
            if( !Utilities.StringIsEmpty( messageData.CallerFirstName ) )
            {
                caller_name += messageData.CallerFirstName;
            }
            
            if( !Utilities.StringIsEmpty( messageData.CallerFirstName ) && !Utilities.StringIsEmpty( messageData.CallerLastName ) )
            {
                caller_name += ' ';
            }
            
            if( !Utilities.StringIsEmpty( messageData.CallerLastName ) )
            {
                caller_name += messageData.CallerLastName;
            }

            // Convert DateStamp to readable date
            if( messageData.DateStamp.HasValue )
            {
	            messageData.DateStampFormatted = messageData.DateStamp.Value.ToString( "M/d/yyyy" );
            }

            // Convert TimeStamp to readable time
            if( messageData.TimeStamp.HasValue )
            {
	            DateTime time = DateTime.Today.Add( messageData.TimeStamp.Value );
	            
	            messageData.TimeStampFormatted = time.ToString( "h:mm tt" );
            }

            // Return the full name with an elipse
            messageData.CallerFullName = caller_name;
            
            // If Is Death Call
            messageData.marked_death_call = "N";

            if( !Utilities.StringIsEmpty( messageData.IsDeathCall ) )
            {
	            if( messageData.IsDeathCall.ToLower().Contains( "death" ) )
	            {
		            messageData.marked_death_call = "Y";
	            }
            }

            return messageData;
		}
	}
}