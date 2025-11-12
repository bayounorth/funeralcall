using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FuneralCallV2.Classes
{
	public class JwtMiddleware
	{
		private readonly RequestDelegate _next;
		private readonly IConfiguration  _configuration;

		public JwtMiddleware( RequestDelegate next, IConfiguration configuration )
		{
			_next          = next;
			_configuration = configuration;
		}

		public async Task Invoke( HttpContext context, IAuthorizationService authorizationService )
		{
			string token = null;
			
			// Check auth header first ...
			token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split( " " ).Last();

			// Check query string ...
			if( token == null )
			{
				token = context.Request.Query["token"].FirstOrDefault()?.Split( " " ).Last();
			}

			if( token != null )
			{
				AttachUserToContext( context, authorizationService, token );
			}

			await _next( context );
		}

		private void AttachUserToContext( HttpContext context, IAuthorizationService authorizationService, string token )
		{
			try
			{
				var tokenHandler	= new JwtSecurityTokenHandler();
				var key		= Encoding.ASCII.GetBytes( _configuration["EncryptionKey"] );
				
				tokenHandler.ValidateToken( token, new TokenValidationParameters
				                                   {
					                                   ValidateIssuerSigningKey = true,
					                                   IssuerSigningKey         = new SymmetricSecurityKey( key ),
					                                   ValidateIssuer           = false,
					                                   ValidateAudience         = false,
					                                   ValidateLifetime         = false,
					                                   ClockSkew				= TimeSpan.Zero
				                                   }, out SecurityToken validatedToken );

				JwtSecurityToken jwtToken      = (JwtSecurityToken)validatedToken;
				int              id            = int.Parse( jwtToken.Claims.First( x => x.Type == "id" ).Value );
				string           userType      = jwtToken.Claims.First( x => x.Type == "type" ).Value;
				string[]         userTypeParts = userType.Split( '.' );

				// attach user to context on successful jwt validation
				context.Items[userTypeParts[2]] = authorizationService.GetAuthorized( id, userType );
			}
			catch
			{
				// do nothing if jwt validation fails
				// user is not attached to context so request won't have access to secure routes
			}
		}
	}
}