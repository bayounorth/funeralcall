using System.Collections.Generic;
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
	public class ClientOfficeInfoController : BaseController
	{
		private CustomerDatabasesDbContext _customerDatabasesDbContext;
		private FuneralCallDbContext       _funeralCallDbContext;

		public ClientOfficeInfoController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, CustomerDatabasesDbContext customerDatabasesDbContext, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_customerDatabasesDbContext = customerDatabasesDbContext;
			_funeralCallDbContext       = funeralCallDbContext;
		}

		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			ClientOfficeInfo clientOfficeInfo = _customerDatabasesDbContext.ClientOfficeInfo.SingleOrDefault( u => u.OfficeID == id );

			return GetRecord( clientOfficeInfo );
		}

		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			var queryable = _customerDatabasesDbContext.ClientOfficeInfo.AsQueryable();
			
			if( search == null )
			{
				search = new Search();
			}

			if( ( search.order_by == null ) || ( search.order_by.Length == 0 ) )
			{
				search.order_by = new string[] { "ClientName" };
			}

			// For client users, only allow their results to be returned ...
			if( ClientUserContext != null )
			{
				List<string> columnsList = new List<string>();
				List<string> searchList  = new List<string>();
				Client       client      = _funeralCallDbContext.Client.SingleOrDefault( cu => cu.id == ClientUserContext.client_id );

				if( search.columns != null )
				{
					columnsList.AddRange( search.columns );
				}

				if( search.search != null )
				{
					searchList.AddRange( search.search );
				}

				columnsList.Add( "AppLogInAcctNumber" );
				searchList.Add( client.account_number.Trim() );

				search.columns            = columnsList.ToArray();
				search.search             = searchList.ToArray();
				search.exact_match_search = true;
			}

			return QueryBuilder( queryable, search );
		}
	}
}