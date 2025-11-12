using FuneralCallV2.Classes;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "[controller]" )]
	public class ErrorController : Controller
	{
		[Route( "" )]
		public IActionResult ServerError()
		{
			var feature = this.HttpContext.Features.Get<IExceptionHandlerFeature>();

			return ApiResponseHandler.HandleError( feature?.Error.Message );
		}
		
		[Route( "{statusCode}" )]
		public IActionResult StatusCodeError( int statusCode )
		{
			return ApiResponseHandler.HandleError( $"The Server responded with status code {statusCode}" );
		}
	}
}