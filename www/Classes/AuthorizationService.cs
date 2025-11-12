using System;
using System.Linq;
using FuneralCallV2.Data;
using Microsoft.EntityFrameworkCore;

namespace FuneralCallV2.Classes
{
	public interface IAuthorizationService
	{
		public dynamic GetAuthorized( Int64 id, string userType );
	}
	
	public class AuthorizationService : IAuthorizationService
	{
		private readonly FuneralCallDbContext _funeralCallDbContext;
		
		public AuthorizationService( FuneralCallDbContext funeralCallDbContext )
        {
	        _funeralCallDbContext = funeralCallDbContext;
        }
		
		public dynamic GetAuthorized( Int64 id, string userType )
		{
			if( userType.Contains( "FuneralCallV2.Models.Employee" ) )
			{
				return _funeralCallDbContext.Employee.AsNoTracking().SingleOrDefault( e => e.id == id && e.is_active == true );
			}
			else if( userType.Contains( "FuneralCallV2.Models.ClientUser" ) )
			{
				return _funeralCallDbContext.ClientUser.AsNoTracking().SingleOrDefault( cu => cu.id == id && cu.is_active == true );
			}

			return null;
		}
	}
}