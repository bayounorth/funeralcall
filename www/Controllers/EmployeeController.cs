using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Message = FuneralCallV2.Classes.Message;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class EmployeeController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;
		
		public EmployeeController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}

		[Authorize]
		[HttpPost]
		[Route( "addEdit" )]
		public IActionResult AddEdit( Employee employee )
		{
			// Only employees can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			if( !ModelState.IsValid )
			{
				return ApiResponseHandler.HandleError( new { validation_errors = Utilities.ErrorList( ModelState ) } );
			}
			
			// Add ...
			if( ( employee.id == null ) || ( employee.id <= 0 ) )
			{
				// Do not allow a regular user to add someone as an admin ...
				if( EmployeeContext.is_admin == false )
				{
					if( employee.is_admin == true )
					{
						return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
					}
				}
			
				// Check for password on new employees ...
				ApiError[] error = Utilities.ValidatePassword( employee.password );

				if( error != null ){ return ApiResponseHandler.HandleError( new { validation_errors = error } ); }
				
				// Do not allow username conflict with client users ...
				ClientUser clientUser = _funeralCallDbContext.ClientUser.FirstOrDefault( cu => cu.username == employee.username );

				if( clientUser != null )
				{
					return ApiResponseHandler.HandleError( new { validation_errors = new[]
				                                                                 {
					                                                                 new ApiError { Field = "username", Description = Message.UsernameUnique.Value },
				                                                                 } } );
				}

				// All clear, create employee ...
				_funeralCallDbContext.Employee.Add( employee );

				employee.password = BCrypt.Net.BCrypt.HashPassword( employee.password );
			}
			else // Edit ...
			{
				// Do not allow a regular user ...
				if( EmployeeContext.is_admin == false )
				{
					// ... to edit someone to create an admin ...
					if( employee.is_admin == true )
					{
						return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
					}
					
					Employee existingEmployee = _funeralCallDbContext.Employee.AsNoTracking().SingleOrDefault( e => e.id == employee.id );
					
					// ... to edit an existing admin ...
					if( existingEmployee.is_admin == true )
					{
						return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
					}
				}
				
				_funeralCallDbContext.Employee.Update( employee );

				// Are they updating the password ...
				if( string.IsNullOrEmpty( employee.password ) == true )
				{
					_funeralCallDbContext.Entry( employee ).Property( p => p.password ).IsModified = false;
				}
				else
				{
					ApiError[] error = Utilities.ValidatePassword( employee.password );

					if( error != null ){ return ApiResponseHandler.HandleError( new { validation_errors = error } ); }
					
					employee.password = BCrypt.Net.BCrypt.HashPassword( employee.password );
				}
			}

			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( employee );
		}

		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			// Only employees can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			Employee employee = _funeralCallDbContext.Employee.SingleOrDefault( u => u.id == id );

			return GetRecord( employee );
		}

		[Authorize]
		[HttpDelete]
		[Route( "delete/{id}" )]
		public IActionResult Delete( int id )
		{
			// Only employees can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }

			Employee employee = _funeralCallDbContext.Employee.SingleOrDefault( u => u.id == id );
			
			// Do not allow a regular user to delete an admin ...
			if( ( EmployeeContext.is_admin == false ) && ( employee.is_admin == true ) )
			{
				return ApiResponseHandler.HandleError( Message.OperationDenied.Value );
			}
			
			return DeleteRecord( _funeralCallDbContext, employee );
		}

		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			// Only employees can perform this ...
			if( !isEmployeeAuthenticated() ){ return ApiResponseHandler.HandleError( Message.Unauthorized.Value ); }
			
			var queryable = _funeralCallDbContext.Employee.AsQueryable();

			if( ( search != null ) && ( search.order_by == null ) )
			{
				search.order_by = new string[]{ "username" };
			}

			return QueryBuilder( queryable, search );
		}
	}
}