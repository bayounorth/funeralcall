using System;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FuneralCallV2.Classes
{
	[AttributeUsage( AttributeTargets.Class | AttributeTargets.Method )]
	public class AuthorizeAttribute : Attribute, IAuthorizationFilter
	{
		public void OnAuthorization( AuthorizationFilterContext context )
		{
			bool isUser   = context.HttpContext.Items.ContainsKey( "Employee" );
			bool isClient = context.HttpContext.Items.ContainsKey( "ClientUser" );

			if( ( !isUser ) && ( !isClient ) )
			{
				context.Result = ApiResponseHandler.HandleError( Message.Unauthorized.Value );
			}
		}
	}
}