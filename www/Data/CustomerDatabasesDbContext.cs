using FuneralCallV2.Models;
using Microsoft.EntityFrameworkCore;

namespace FuneralCallV2.Data
{
	public class CustomerDatabasesDbContext : DbContext
	{
		public DbSet<MessageData>      MessageData      { get; set; }
		public DbSet<AppUserInfo>      AppUserInfo      { get; set; }
		public DbSet<ClientOfficeInfo> ClientOfficeInfo { get; set; }
		
		public CustomerDatabasesDbContext( DbContextOptions<CustomerDatabasesDbContext> options ) : base( options )
		{
		}
	}
}