using System.Linq;
using System.Threading.Tasks;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class ClientUserController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;

		public ClientUserController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}

		[Authorize]
		[HttpPost]
		[Route( "addEdit" )]
		public IActionResult AddEdit( ClientUser clientUser )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			if( !ModelState.IsValid )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = Utilities.ErrorList( ModelState ) } );
			}

			// Add ...
			if( ( clientUser.id == null ) || ( clientUser.id <= 0 ) )
			{
				// Check for password on new client user ...
				ApiError[] error = Utilities.ValidatePassword( clientUser.password );

				if( error != null ){ return ApiResponseHandler.HandleError( new { validation_errors = error } ); }
				
				// Do not allow username conflict with employees ...
				Employee employee = _funeralCallDbContext.Employee.FirstOrDefault( e => e.username == clientUser.username );

				if( employee != null )
				{
					return ApiResponseHandler.HandleError( new { validation_errors = new[]
				                                                                 {
					                                                                 new ApiError { Field = "username", Description = Message.UsernameUnique.Value },
				                                                                 } } );
				}

				// All clear, create client user ...
				_funeralCallDbContext.ClientUser.Add( clientUser );

				clientUser.password = BCrypt.Net.BCrypt.HashPassword( clientUser.password );
			}
			else
			{
				_funeralCallDbContext.ClientUser.Update( clientUser );
				
				// Do not modify these fields ...
				_funeralCallDbContext.Entry( clientUser ).Property( p => p.app_token ).IsModified       = false;
				_funeralCallDbContext.Entry( clientUser ).Property( p => p.notifications ).IsModified   = false;
				_funeralCallDbContext.Entry( clientUser ).Property( p => p.firstcall_sound ).IsModified = false;
				_funeralCallDbContext.Entry( clientUser ).Property( p => p.standard_sound ).IsModified  = false;

				// Are they updating the password ...
				if( string.IsNullOrEmpty( clientUser.password ) == true )
				{
					_funeralCallDbContext.Entry( clientUser ).Property( p => p.password ).IsModified = false;
				}
				else
				{
					ApiError[] error = Utilities.ValidatePassword( clientUser.password );

					if( error != null ){ return ApiResponseHandler.HandleError( new { validation_errors = error } ); }

					clientUser.password = BCrypt.Net.BCrypt.HashPassword( clientUser.password );

					// If password changed, logout user from mobile app ...
					ClientUser user = _funeralCallDbContext.ClientUser.AsNoTracking().FirstOrDefault( cu => cu.id == clientUser.id );
					
					if( ( user.app_token != null ) && ( user.app_token.Length > 0 ) )
					{
						SendNotification( user.app_token, "FuneralCall Message", "Password Change", "", "0", "-99" );
					}
				}
			}

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( clientUser );
		}

		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			var clientUser = ( from cu in _funeralCallDbContext.ClientUser
						                   where cu.id == id
						                   select new
						                          {
							                          cu.id,
							                          cu.client_id,
							                          cu.username,
							                          cu.password,
							                          cu.password_reset_token,
							                          cu.email_address,
							                          cu.first_name,
							                          cu.last_name,
							                          cu.office_number,
							                          cu.cell_phone_number,
							                          cu.is_active,
							                          cu.app_token,
							                          cu.notifications,
							                          cu.firstcall_sound,
							                          cu.standard_sound
						                          } ).SingleOrDefault();

			return GetRecord( clientUser );
		}

		[Authorize]
		[HttpDelete]
		[Route( "delete/{id}" )]
		public IActionResult Delete( int id )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			ClientUser clientUser = _funeralCallDbContext.ClientUser.SingleOrDefault( u => u.id == id );

			return DeleteRecord( _funeralCallDbContext, clientUser );
		}

		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }

			var queryable = ( from cu in _funeralCallDbContext.ClientUser
			                  join c in _funeralCallDbContext.Client on cu.client_id equals c.id
			                  select new
			                         {
				                         cu.id,
				                         cu.client_id,
				                         cu.username,
				                         cu.password,
				                         cu.password_reset_token,
				                         cu.email_address,
				                         cu.first_name,
				                         cu.last_name,
				                         cu.office_number,
				                         cu.cell_phone_number,
				                         cu.is_active,
				                         cu.app_token,
				                         cu.notifications,
				                         cu.firstcall_sound,
				                         cu.standard_sound,
				                         c.account_number,
				                         c.client_name,
			                         } ).AsQueryable();
			
			if( search == null )
			{
				search = new Search();
			}

			if( ( search.order_by == null ) || ( search.order_by.Length == 0 ) )
			{
				search.order_by = new string[] { "username" };
			}

			return QueryBuilder( queryable, search );
		}

		[HttpPost]
		[Route( "sendNotification" )]
		public async Task<IActionResult> SendNotification( [FromBody] JObject request )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			int        client_user_id   = Utilities.JsonToType<int>( request["client_user_id"], -99 );
			string     message          = Utilities.JsonToType<string>( request["message"], null );
			ClientUser clientUser       = _funeralCallDbContext.ClientUser.SingleOrDefault( u => u.id == client_user_id );
			string     sound            = clientUser.standard_sound;
			string     message_response = null;

			if( ( sound == null ) || ( sound.Length == 0 ) )
			{
				sound = "generalmessage";
			}
			
			if( ( message == null ) || ( message.Length == 0 ) )
			{
				message = "FuneralCall Support Test Message";
			}
			
			if( ( clientUser.app_token != null ) && ( clientUser.app_token.Length > 0 ) )
			{
				message_response = await SendNotification( clientUser.app_token, "FuneralCall Support Test", message, sound, "0", "-98" );
			}

			return ApiResponseHandler.HandleSuccess( message_response );
		}
	}
}