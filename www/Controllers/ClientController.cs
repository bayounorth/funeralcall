using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class ClientController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;

		public ClientController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}
		
		[Authorize]
		[HttpPost]
		[Route( "addEdit" )]
		public IActionResult AddEdit( Client client )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }

			if( !ModelState.IsValid )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = Utilities.ErrorList( ModelState ) } );
			}
			
			// Add ...
			if( ( client.id == null ) || ( client.id <= 0 ) )
			{
				// Create client ...
				_funeralCallDbContext.Client.Add( client );
			}
			else // Edit ...
			{
				_funeralCallDbContext.Client.Update( client );
			}

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( client );
		}

		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			var client = ( from c in _funeralCallDbContext.Client
							               where c.id == id
							               select new
							                      {
								                      c.id,
								                      c.account_number,
								                      c.client_name,
								                      c.is_active
							                      } ).SingleOrDefault();

			return GetRecord( client );
		}

		[Authorize]
		[HttpDelete]
		[Route( "delete/{id}" )]
		public IActionResult Delete( int id )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			Client client = _funeralCallDbContext.Client.SingleOrDefault( u => u.id == id );

			return DeleteRecord( _funeralCallDbContext, client );
		}

		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			// Only users can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			var queryable = _funeralCallDbContext.Client.Select( c => new 
			                                                          {
				                                                          c.id,
				                                                          c.account_number,
				                                                          c.client_name,
				                                                          c.is_active
			                                                          } ).AsQueryable();

			if( search == null )
			{
				search = new Search();
			}

			if( ( search.order_by == null ) || ( search.order_by.Length == 0 ) )
			{
				search.order_by = new string[] { "client_name" };
			}

			return QueryBuilder( queryable, search );
		}
	}
}