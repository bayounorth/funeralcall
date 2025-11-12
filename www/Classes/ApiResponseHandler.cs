using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace FuneralCallV2.Classes
{
	public class ApiResponseHandler
	{
		public static JsonResult HandleSuccess( object data )
		{
			return BuildResponse( true, data );
		}

		public static JsonResult HandleError( object data )
		{
			return BuildResponse( false, data );
		}
		
		private static JsonResult BuildResponse( Boolean success, object data )
		{
			return new JsonResult( new { success = success, data = data } )
				       {
					       StatusCode = success ? StatusCodes.Status200OK : StatusCodes.Status500InternalServerError
				       };
		}
	}
}