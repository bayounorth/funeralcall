using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class UpgradeController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;

		public UpgradeController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}

		[HttpGet]
		[Route( "migrateClients" )]
		public IActionResult MigrateClients()
		{
			// Migrate UserMaster to clients ... 
			var userMaster = ( from tblUserMaster in _funeralCallDbContext.UserMaster
			                   join users in _funeralCallDbContext.AspNetUsers on tblUserMaster.UserToken equals users.UserId into merged
			                   from combinedUsers in merged.DefaultIfEmpty()
			                   select new
			                          {
				                          combinedUsers.UserName,
				                          tblUserMaster.FirstName,
				                          tblUserMaster.LastName,
				                          tblUserMaster.IsActive,
				                          tblUserMaster.UserToken,
				                          tblUserMaster.UserID
			                          } ).AsQueryable().ToList();

			foreach( var user in userMaster )
			{
				Client client = new Client();

				client.account_number = user.UserName;
				client.client_name    = string.Format( "{0} {1}", user.FirstName, user.LastName );
				client.is_active      = user.IsActive;

				_funeralCallDbContext.Client.Add( client );
				_funeralCallDbContext.SaveChanges();

				// Migrate AspNetUsers to client logins ...
				var clientLogins = ( from users in _funeralCallDbContext.AspNetUsers 
				                    join membership in _funeralCallDbContext.AspNetMembership on users.UserId equals membership.UserId
				                    where user.UserToken == users.UserId
				                    select new
				                           {
					                           users.UserName,

					                           membership.Password,
					                           membership.Email
				                           }
									).AsQueryable().ToList();

				foreach( var clientLogin in clientLogins )
				{
					string     password   = Utilities.DecryptString( clientLogin.Password, Configuration["EncryptionKey"] );
					ClientUser clientUser = new ClientUser();

					clientUser.client_id       = client.id.Value;
					clientUser.username        = clientLogin.UserName;
					clientUser.password        = BCrypt.Net.BCrypt.HashPassword( password );
					clientUser.email_address   = clientLogin.Email;
					clientUser.first_name      = user.FirstName;
					clientUser.last_name       = user.LastName;
					clientUser.is_active       = user.IsActive;
					clientUser.notifications   = true;
					clientUser.standard_sound  = "generalmessage";
					clientUser.firstcall_sound = "firstcall";

					_funeralCallDbContext.ClientUser.Add( clientUser );
					_funeralCallDbContext.SaveChanges();
				}

				// Migrate tbl_FuneralCallMaster to client obituaries ...
				string insertStatement = string.Format( @"INSERT INTO client_obituary( client_id, CastType, DecName, Age, DOD, Chapel, LivedAt, VisitationDate, VisitationTime, VisitationLocation, Rosary, ServiceDate,
																		ServiceTime, ServiceLocation, Mass, BurialLocation, BurialAddress, BurialDirections, Shiva, ShivaDirections, Flowers, Memorials,
																		PastService, IsPurged, NOK, OtherInfo, StampInitial, StampTime, IsActive, Trisagionservice, SecondVisitationDate, SecondVisitationTime, 
                            											SecondVisitationLocation, OtherServices )
																		SELECT {0}, CastType, DecName, Age, DOD, Chapel, LivedAt, VisitationDate, VisitationTime, VisitationLocation, Rosary, ServiceDate,
																		ServiceTime, ServiceLocation, Mass, BurialLocation, BurialAddress, BurialDirections, Shiva, ShivaDirections, Flowers, Memorials,
																		PastService, IsPurged, NOK, OtherInfo, StampInitial, StampTime, IsActive, Trisagionservice, SecondVisitationDate, SecondVisitationTime, 
																		SecondVisitationLocation, OtherServices 
																		FROM tbl_FuneralCallMaster WHERE CreatedBy = {1}", client.id, user.UserID );

				_funeralCallDbContext.Database.ExecuteSqlRaw( insertStatement );
			}
			
			// Migrate null CreatedBy's from tbl_FuneralCallMaster to client obituaries ...
			string insertStatementTwo = @"INSERT INTO client_obituary( client_id, CastType, DecName, Age, DOD, Chapel, LivedAt, VisitationDate, VisitationTime, VisitationLocation, Rosary, ServiceDate,
														ServiceTime, ServiceLocation, Mass, BurialLocation, BurialAddress, BurialDirections, Shiva, ShivaDirections, Flowers, Memorials,
														PastService, IsPurged, NOK, OtherInfo, StampInitial, StampTime, IsActive, Trisagionservice, SecondVisitationDate, SecondVisitationTime, 
                            							SecondVisitationLocation, OtherServices )
														SELECT -1, CastType, DecName, Age, DOD, Chapel, LivedAt, VisitationDate, VisitationTime, VisitationLocation, Rosary, ServiceDate,
														ServiceTime, ServiceLocation, Mass, BurialLocation, BurialAddress, BurialDirections, Shiva, ShivaDirections, Flowers, Memorials,
														PastService, IsPurged, NOK, OtherInfo, StampInitial, StampTime, IsActive, Trisagionservice, SecondVisitationDate, SecondVisitationTime, 
														SecondVisitationLocation, OtherServices 
														FROM tbl_FuneralCallMaster WHERE CreatedBy IS NULL";

			_funeralCallDbContext.Database.ExecuteSqlRaw( insertStatementTwo );

			return Ok();
		}

		[HttpGet]
		[Route( "migrateClientUsers" )]
		public IActionResult MigrateClientUsers()
		{
			var queryable = ( from subAccounts in _funeralCallDbContext.SubAccounts
			                  join clientUser in _funeralCallDbContext.ClientUser on subAccounts.MainAccountUsername.ToString() equals clientUser.username into cu
			                  from clientUsers in cu.DefaultIfEmpty()
			                  select new
			                         {
				                         client_id = clientUsers == null ? -1 : clientUsers.client_id,
				                         subAccounts.Username,
				                         subAccounts.Password,
				                         subAccounts.FirstName,
				                         subAccounts.LastName,
				                         subAccounts.IsActive,
				                         subAccounts.OfficeNumber,
				                         subAccounts.CellPhoneNumber,
				                         subAccounts.MainAccountUsername
			                         }
				).AsQueryable().ToList();

			foreach ( var record in queryable )
			{
				int    client_id           = record.client_id;
				string mainAccountUsername = record.MainAccountUsername.ToString();
				
				// These do not have client records, need to create dummy records ...
				if( client_id == -1 )
				{
					Client client = _funeralCallDbContext.Client.AsNoTracking().FirstOrDefault( c => c.account_number == mainAccountUsername );

					if( client == null )
					{
						client = new Client();

						client.account_number = mainAccountUsername;
						client.client_name    = string.Format( "{0} Auto created", mainAccountUsername );
						client.is_active      = true;

						_funeralCallDbContext.Client.Add( client );
						_funeralCallDbContext.SaveChanges();
					}

					client_id = client.id.Value;
				}
				
				ClientUser clientUser = new ClientUser();

				clientUser.client_id         = client_id;
				clientUser.username          = record.Username;
				clientUser.password          = record.Password;
				clientUser.first_name        = record.FirstName;
				clientUser.last_name         = record.LastName;
				clientUser.is_active         = record.IsActive;
				clientUser.office_number     = Utilities.CleanPhoneNumber( record.OfficeNumber );
				clientUser.cell_phone_number = Utilities.CleanPhoneNumber( record.CellPhoneNumber );

				_funeralCallDbContext.ClientUser.Add( clientUser );
				_funeralCallDbContext.SaveChanges();
			}

			return Ok();
		}
	}
}