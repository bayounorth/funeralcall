using System;
using System.Collections.Generic;
using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;

namespace FuneralCallV2.Classes
{
	public class Utilities
	{
		public static string DecryptString( string cipherText, string keyString )
		{
			var fullCipher = Convert.FromBase64String( cipherText );
			var iv         = new byte[16];
			var cipher     = new byte[fullCipher.Length - iv.Length];
			var key        = Convert.FromHexString( keyString );

			Buffer.BlockCopy( fullCipher, 0, iv, 0, iv.Length );
			Buffer.BlockCopy( fullCipher, iv.Length, cipher, 0, fullCipher.Length - iv.Length );

			using ( var aesAlg = Aes.Create() )
			{
				using ( var decryptor = aesAlg.CreateDecryptor( key, iv ) )
				{
					string result;

					using ( var msDecrypt = new MemoryStream( cipher ) )
					{
						using ( var csDecrypt = new CryptoStream( msDecrypt, decryptor, CryptoStreamMode.Read ) )
						{
							using ( var srDecrypt = new StreamReader( csDecrypt ) )
							{
								result = srDecrypt.ReadToEnd();
							}
						}
					}

					var bytes = Encoding.Convert( Encoding.Unicode, Encoding.ASCII, Encoding.UTF8.GetBytes( result ) );

					return Encoding.UTF8.GetString( bytes );
				}
			}
		}

		public static string JsonToString( JToken value, string defaultValue )
		{
			if( value != null )
			{
				return value.ToString();
			}

			if( defaultValue != null )
			{
				return defaultValue;
			}

			return null;
		}

		public static T JsonToType<T>( JToken value, T defaultValue )
		{
			if( ( value != null ) && ( value.Type != JTokenType.Null ) )
			{
				return value.Value<T>();
			}

			if( defaultValue != null )
			{
				return defaultValue;
			}

			return default;
		}

		public static List<ApiError> ErrorList( ModelStateDictionary modelState )
		{
			return modelState
                       .Where( modelError => modelError.Value.Errors.Count > 0 )
                       .Select( modelError => new ApiError
                                              {
                                                  Field       = modelError.Key,
                                                  Description = modelError.Value.Errors.FirstOrDefault().ErrorMessage
                                              } ).ToList();
		}

		public static ApiError[] ValidatePassword( string password )
		{
			if( ( password == null ) || ( password.Length < 4 ) )
			{
				return new[]
                       {
                           new ApiError
                           {
                               Field       = "password",
                               Description = Message.PasswordInvalid.Value
                           }
                       };
			}

			return null;
		}

		public static string CleanPhoneNumber( string number )
		{
			string phoneNumber = null;
			
			if( ( number == null ) || ( number.Length < 10 ) )
			{
				return null;
			}

			if( number.Length == 10 )
			{
				return number;
			}

			phoneNumber = new string( number.Trim().Where( c => char.IsDigit( c ) ).ToArray() );

			if( ( phoneNumber.Length < 10 ) || ( phoneNumber.Length > 10 ) )
			{
				return null;
			}

			return phoneNumber;
		}

		public static string SafeGetString( DbDataReader reader, int colIndex, string defaultValue )
		{
			if( !reader.IsDBNull( colIndex ) )
			{
				return reader.GetString( colIndex );
			}

			return defaultValue;
		}

		public static int SafeGetInteger( DbDataReader reader, int colIndex, int defaultValue )
		{
			if( !reader.IsDBNull( colIndex ) )
			{
				return reader.GetInt32( colIndex );
			}

			return defaultValue;
		}

		public static JwtSecurityToken ValidateToken( string encryptionKey, string token )
		{
			try
			{
				var tokenHandler	= new JwtSecurityTokenHandler();
				var key		= Encoding.ASCII.GetBytes( encryptionKey );
				
				tokenHandler.ValidateToken( token, new TokenValidationParameters
				                                   {
					                                   ValidateIssuerSigningKey = true,
					                                   IssuerSigningKey         = new SymmetricSecurityKey( key ),
					                                   ValidateIssuer           = false,
					                                   ValidateAudience         = false, 
					                                   ClockSkew				= TimeSpan.Zero
				                                   }, out SecurityToken validatedToken );

				return (JwtSecurityToken)validatedToken;
			}
			catch
			{
			}

			return null;
		}

		public static bool StringIsEmpty( string value )
		{
			if( value == null )
			{
				return true;
			}

			if( value.Length == 0 )
			{
				return true;
			}

			return false;
		}

		public static string StringSafeTrim( string value )
		{
			if( value == null )
			{
				return null;
			}

			return value.Trim();
		}

		public static string StringSafeTrim( string value, string defaultValue )
		{
			if( value == null )
			{
				return defaultValue;
			}

			return value.Trim();
		}
	}
}