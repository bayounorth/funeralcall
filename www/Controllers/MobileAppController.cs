using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class MobileAppController : BaseController
	{
		private CustomerDatabasesDbContext _customerDatabasesDbContext;
		private FuneralCallDbContext       _funeralCallDbContext;
		
		public MobileAppController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, CustomerDatabasesDbContext customerDatabasesDbContext, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_customerDatabasesDbContext = customerDatabasesDbContext;
			_funeralCallDbContext       = funeralCallDbContext;
		}

		[Authorize]
		[HttpPost]
		[Route( "updateClientUser" )]
		public IActionResult UpdateClientUser( ClientUser clientUser )
		{
			// Only client users can perform this ...
			if( !isClientAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }

			ClientUser user = _funeralCallDbContext.ClientUser.FirstOrDefault( cu => cu.id == clientUser.id );

			if( user == null ){ return ApiResponseHandler.HandleError( Message.RecordNotFound.Value ); }

			user.notifications   = clientUser.notifications;
			user.firstcall_sound = clientUser.firstcall_sound;
			user.standard_sound  = clientUser.standard_sound;

			_funeralCallDbContext.ClientUser.Update( user );

			_funeralCallDbContext.Entry( user ).Property( p => p.app_token ).IsModified	= false;
			_funeralCallDbContext.Entry( user ).Property( p => p.password ).IsModified		= false;

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( clientUser );
		}

		[Authorize]
		[HttpPost]
		[Route( "logoutClientUser" )]
		public IActionResult LogoutClientUser( ClientUser clientUser )
		{
			// Only client users can perform this ...
			if( !isClientAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			ClientUser user = _funeralCallDbContext.ClientUser.FirstOrDefault( cu => cu.id == clientUser.id );

			if( user == null ){ return ApiResponseHandler.HandleError( Message.RecordNotFound.Value ); }

			user.app_token = null;

			_funeralCallDbContext.ClientUser.Update( user );

			_funeralCallDbContext.Entry( user ).Property( p => p.password ).IsModified = false;

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( clientUser );
		}

		[HttpPost]
		[Route( "sendNotification" )]
		public async Task<IActionResult> SendNotification( [FromBody] JObject request )
		{
			int         msgID       = Utilities.JsonToType<int>( request["msgID"], -99 );
			MessageData messageData = _customerDatabasesDbContext.MessageData.FirstOrDefault( m => m.msgID == msgID );

			if( messageData == null )
			{
				return ApiResponseHandler.HandleError( Message.RecordNotFound.Value );
			} 

			return await SendNotificationInternal( messageData.AcctNum, messageData.CallerFirstName, messageData.CallerLastName, messageData.IsDeathCall, messageData.FacilityName, msgID );
		}

		[HttpPost]
		[Route( "sendNotificationTrigger" )]
		public async Task<IActionResult> SendNotificationTrigger( [FromBody] JObject request )
		{
			JArray messageData     = Utilities.JsonToType<JArray>( request["MessageData"], null );
			int    msgID           = Utilities.JsonToType<int>( messageData[0]["msgID"], -99 );
			string AcctNum         = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["AcctNum"], null ) );
			string CallerFirstName = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["CallerFirstName"], null ) );
			string CallerLastName  = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["CallerLastName"], null ) );
			string IsDeathCall     = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["IsDeathCall"], null ) );
			string FacilityName    = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["FacilityName"], null ) );
			string IsRead          = Utilities.StringSafeTrim( Utilities.JsonToType<string>( messageData[0]["IsRead"], null ) );

			if( !Utilities.StringIsEmpty( IsRead ) )
			{
				if( IsRead.CompareTo( "Y" ) == 0 )
				{
					return ApiResponseHandler.HandleSuccess( Message.Success.Value );
				}
			}

			return await SendNotificationInternal( AcctNum, CallerFirstName, CallerLastName, IsDeathCall, FacilityName, msgID );
		}

		[HttpGet]
		public string Get()
		{
			string password	= Utilities.DecryptString( "9vT2WxKRZ9mgfda2ojUQN+vnqK1VPzk86fHHpMQTPLg=", Configuration["EncryptionKey"] );

			string result = SendNotification( "ed6nflWtkURAj9nawIUYEu:APA91bFfawn9LPa_h888GbNAptHjn0HmFca4h2qLIlqajdMwwGy0HbhId0n3ELC8SfGFmJqHbVHOxp448WDq6wpfy4XBUeNU103lWNjMJyuJwoAl2HmzfYpEVjrkBjnLrSUtMwF9iJNf", "Title", "Body...", "chord", "1", "1520563" ).Result;
			
			return result;
		}
		
		/* Private Methods */
		private async Task<IActionResult> SendNotificationInternal( string AcctNum, string CallerFirstName, string CallerLastName, string IsDeathCall, string FacilityName, int msgID )
		{
			Client client           = _funeralCallDbContext.Client.FirstOrDefault( c => c.account_number == AcctNum );
			string message_response = null;

			// Log problem, do not return failure ...
			if( client == null )
			{
				TransactionLog transactionLog = new TransactionLog();
				var            transaction    = new
				                                {
					                                AcctNum			= AcctNum, 
					                                CallerFirstName	= CallerFirstName, 
					                                CallerLastName	= CallerLastName, 
					                                IsDeathCall		= IsDeathCall, 
					                                FacilityName	= FacilityName, 
					                                msgID			= msgID
				                                };

				transactionLog.transaction_type         = -1;
				transactionLog.transaction_before       = null;
				transactionLog.transaction_after        = JsonConvert.SerializeObject( transaction );
				transactionLog.transaction_datetime     = DateTime.UtcNow;
				transactionLog.transaction_account_id   = -1;
				transactionLog.transaction_account_type = "NoUserLoggedIn";

				_funeralCallDbContext.TransactionLog.Add( transactionLog );
				_funeralCallDbContext.SaveChanges();
				
				return ApiResponseHandler.HandleSuccess( Message.RecordNotFound.Value );
			}

			List<ClientUser> clientUsers = _funeralCallDbContext.ClientUser.Where( cu => cu.client_id == client.id ).AsQueryable().ToList();

			foreach( ClientUser clientUser in clientUsers )
			{
				if( clientUser.notifications != true ){ continue; }
				if( Utilities.StringIsEmpty( clientUser.app_token ) ){ continue; }

				string body         = Utilities.StringSafeTrim( CallerFirstName, "" );
				string sound        = clientUser.standard_sound;
				int    messageCount = 0;

				using( new TransactionScope( TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted } ) )
				{
					var options = new DbContextOptionsBuilder<CustomerDatabasesDbContext>()
					              .UseSqlServer( Configuration.GetConnectionString( "CustomerDatabases" ) )
					              .Options;
					
					using( var db = new CustomerDatabasesDbContext( options ) )
					{
						messageCount = db.MessageData.Count( m => m.AcctNum == AcctNum && m.IsRead != "Y" );
					}
				}

				if( !Utilities.StringIsEmpty( CallerLastName ) )
				{
					body += " " + CallerLastName.Trim();
				}

				if( !Utilities.StringIsEmpty( IsDeathCall ) )
				{
					if( IsDeathCall.ToLower().Contains( "death" ) )
					{
						if( !Utilities.StringIsEmpty( FacilityName ) )
						{
							body += " - " + FacilityName.Trim();
						}
						
						sound = clientUser.firstcall_sound;
					}
				}
				
				if( Utilities.StringIsEmpty( sound ) )
				{
					sound = "generalmessage";
				}

				message_response = await SendNotification( clientUser.app_token, "FuneralCall Message", body, sound, messageCount.ToString(), msgID.ToString() );
				
				// Log response ...
				TransactionLog transactionLog = new TransactionLog();
				var            transaction    = new { NotificationResponse = message_response, msgID = msgID };

				transactionLog.transaction_type         = -1;
				transactionLog.transaction_before       = null;
				transactionLog.transaction_after        = JsonConvert.SerializeObject( transaction );
				transactionLog.transaction_datetime     = DateTime.UtcNow;
				transactionLog.transaction_account_id   = -1;
				transactionLog.transaction_account_type = "NoUserLoggedIn";

				_funeralCallDbContext.TransactionLog.Add( transactionLog );
				_funeralCallDbContext.SaveChanges();
			}
			
			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}
	}
}