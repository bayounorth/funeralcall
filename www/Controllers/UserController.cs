using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
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
	public class UserController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;

		public UserController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}
		
		[HttpPost]
		[Route( "authenticate" )]
		public IActionResult Authenticate( [FromBody] JObject request )
		{
			string         username = Utilities.JsonToString( request["username"], null );
			string         password = Utilities.JsonToString( request["password"], null );
			string         fcmToken = Utilities.JsonToString( request["fcmToken"], null );
			List<ApiError> errors   = new List<ApiError>();

			if( ( username == null ) || ( username.Length == 0 ) )
			{
				errors.Add( new ApiError() { Field = "username", Description = Message.FieldRequired.Value } );
			}

			if( ( password == null ) || ( password.Length == 0 ) )
			{
				errors.Add( new ApiError() { Field = "password", Description = Message.FieldRequired.Value } );
			}

			if( errors.Count > 0 )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = errors } );
			}
			
			// Check if this is a client logging in ...
			ClientUser clientUser = _funeralCallDbContext.ClientUser.SingleOrDefault( cu => cu.username == username && cu.is_active == true );
			Employee   employee   = null;

			if( clientUser == null )
			{
				// Check to see if an employee ...
				employee = _funeralCallDbContext.Employee.SingleOrDefault( u => u.username == username && u.is_active == true );
			}

			// Not a valid login ...
			if( ( clientUser == null ) && ( employee == null ) )
			{
				return ReturnInvalidUsernamePassword();
			}
			
			// Check client user password ...
			if( clientUser != null )
			{
				if( BCrypt.Net.BCrypt.Verify( password, clientUser.password ) != true )
				{
					return ReturnInvalidUsernamePassword();
				}
				
				// Save app token sent ...
				clientUser.app_token = fcmToken;

				_funeralCallDbContext.ClientUser.Update( clientUser );
				_funeralCallDbContext.SaveChanges();
				
				return ApiResponseHandler.HandleSuccess
											( 
												new
												{
													redirect	= "/client",
													access		= 0,
													token		= GenerateJwtToken( clientUser.id.ToString(), typeof( ClientUser ).ToString() ),
													user		= new
													              {
														              clientUser.id,
														              clientUser.username,
														              clientUser.office_number,
														              clientUser.cell_phone_number,
														              clientUser.notifications, 
														              clientUser.standard_sound,
														              clientUser.firstcall_sound
													              }
												} );
			}
			
			// Check employee password ...
			if( employee != null )
			{
				if( BCrypt.Net.BCrypt.Verify( password, employee.password ) != true )
				{
					return ReturnInvalidUsernamePassword();
				}

				int level = 1;

				if( employee.is_supervisor == true )
				{
					level = 2;
				}
				else if( employee.is_admin == true )
				{
					level = 99;
				}
				
				return ApiResponseHandler.HandleSuccess( new { redirect = "/administration", access = level, token = GenerateJwtToken( employee.id.ToString(), typeof( Employee ).ToString() ) } );
			}

			return ApiResponseHandler.HandleError( Message.Unauthorized.Value );
		}
		
		[HttpPost]
		[Route( "forgot-password" )]
		public IActionResult ForgotPassword( [FromBody] JObject request )
		{
			string         username      = Utilities.JsonToString( request["username"], null );
			List<ApiError> errors        = new List<ApiError>();
			string         origin        = "https://www.myfuneralcall.com";
			
			if( ( username == null ) || ( username.Length == 0 ) )
			{
				errors.Add( new ApiError() { Field = "username", Description = Message.FieldRequired.Value } );
			}

			if( errors.Count > 0 )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = errors } );
			}

			ClientUser clientUser = _funeralCallDbContext.ClientUser.SingleOrDefault( cu => cu.username == username && cu.is_active == true );
			
			if( clientUser == null )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = new[]
				                                                                 {
					                                                                 new ApiError { Field = "username", Description = Message.NotFound.Value },
				                                                                 } } );
			}

			if( ( clientUser.email_address == null ) || ( clientUser.email_address.Length == 0 ) )
			{
				clientUser.email_address = EmailSender.EmailConfig.From;
			}

			Client			client	= _funeralCallDbContext.Client.SingleOrDefault( c => c.id == clientUser.client_id );
			string			token	= GenerateJwtToken( clientUser.id.ToString(), typeof( ClientUser ).ToString() );
			EmailMessage	message	= new EmailMessage
											(
											 new string[] { clientUser.email_address },
											 "FuneralCall - Password Reset Request",
											 string.Format( "<h2>A passcode reset has been requested for a user of {0} {1}.<br /><br />User requesting passcode reset: {2}.<br /><br /><a href='{3}/reset-password/{4}'>Click here to reset your FuneralCall password.</a></h2>", client.account_number, client.client_name, clientUser.username, origin, token ),
											 null
											);
			
			EmailSender.SendEmail( message );
			
			System.Threading.Thread.Sleep( 1000 ); // Sleep one second before sending another email, so they don't think it's spam ...
			
			// Send notification to customer support ...
			EmailMessage support_message = new EmailMessage
												(
												 new string[] { EmailSender.EmailConfig.From },
												 "FuneralCall - Password Reset Requested Notification",
												 string.Format( "<h2>A passcode reset has been requested on the FuneralCall portal.<br /><br />Primary Client Account: {0} {1}<br /><br />Reset Requested For User: {2}</h2>", client.account_number, client.client_name, clientUser.username ),
												 null
												);

			EmailSender.SendEmail( support_message );
			
			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}

		[HttpPost]
		[Route( "reset-password" )]
		public IActionResult ResetPassword( [FromBody] JObject request )
		{
			string         password         = Utilities.JsonToString( request["password"], null );
			string         confirm_password = Utilities.JsonToString( request["confirm_password"], null );
			string         token            = Utilities.JsonToString( request["token"], null );
			List<ApiError> errors           = new List<ApiError>();
			
			if( ( password == null ) || ( password.Length == 0 ) )
			{
				errors.Add( new ApiError() { Field = "password", Description = Message.FieldRequired.Value } );
			}
			
			if( ( confirm_password == null ) || ( confirm_password.Length == 0 ) )
			{
				errors.Add( new ApiError() { Field = "confirm_password", Description = Message.FieldRequired.Value } );
			}

			if( errors.Count > 0 )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = errors } );
			}

			if( ( token == null ) || ( token.Length == 0 ) )
			{
				return ApiResponseHandler.HandleError( new
				                                       {
					                                       validation_errors = new[]
					                                                           {
						                                                           new ApiError { Field = "password", Description         = Message.Unauthorized.Value },
						                                                           new ApiError { Field = "confirm_password", Description = Message.Unauthorized.Value }
					                                                           }
				                                       } );
			}

			ApiError[] error = Utilities.ValidatePassword( password );
			
			if( error != null ){ return ApiResponseHandler.HandleError( new { validation_errors = error } ); }

			if( password.CompareTo( confirm_password ) != 0 )
			{
				return ApiResponseHandler.HandleError( new
				                                       {
					                                       validation_errors = new[]
					                                                           {
						                                                           new ApiError { Field = "password", Description         = Message.PasswordsNoMatch.Value },
						                                                           new ApiError { Field = "confirm_password", Description = Message.PasswordsNoMatch.Value }
					                                                           }
				                                       } );
			}

			JwtSecurityToken jwtSecurityToken = Utilities.ValidateToken( Configuration["EncryptionKey"], token );
			
			if( jwtSecurityToken == null )
			{
				return ApiResponseHandler.HandleError( new
				                                       {
					                                       validation_errors = new[]
					                                                           {
						                                                           new ApiError { Field = "password", Description         = Message.Unauthorized.Value },
						                                                           new ApiError { Field = "confirm_password", Description = Message.Unauthorized.Value }
					                                                           }
				                                       } );
			}

			int        id         = int.Parse( jwtSecurityToken.Claims.First( x => x.Type == "id" ).Value );
			ClientUser clientUser = _funeralCallDbContext.ClientUser.SingleOrDefault( cu => cu.id == id );

			_funeralCallDbContext.ClientUser.Update( clientUser );

			clientUser.password = BCrypt.Net.BCrypt.HashPassword( password );

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( Message.Success.Value );
		}
		
		/* Private Methods */
		private IActionResult ReturnInvalidUsernamePassword()
		{
			return ApiResponseHandler.HandleError( new
			                                       {
				                                       validation_errors = new[]
				                                                           {
					                                                           new ApiError { Field = "username", Description = Message.NotFound.Value },
					                                                           new ApiError { Field = "password", Description = Message.NotFound.Value }
				                                                           }
			                                       } );
		}
	}
}