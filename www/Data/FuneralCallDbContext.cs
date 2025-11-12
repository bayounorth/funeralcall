using System;
using System.Linq;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace FuneralCallV2.Data
{
	public class FuneralCallDbContext : DbContext
	{
		private readonly IHttpContextAccessor _httpContextAccessor;
		
		public DbSet<Employee>                 Employee                 { get; set; }
		public DbSet<Client>                   Client                   { get; set; }
		public DbSet<ClientUser>               ClientUser               { get; set; }
		public DbSet<ClientUserDeletedMessage> ClientUserDeletedMessage { get; set; }
		public DbSet<ClientObituary>           ClientObituary           { get; set; }
		public DbSet<TransactionLog>           TransactionLog           { get; set; }

		// Used only for migration ...
		public DbSet<AspNetUsers>       AspNetUsers       { get; set; }
		public DbSet<AspNetMembership>  AspNetMembership  { get; set; }
		public DbSet<UserMaster>        UserMaster        { get; set; }
		public DbSet<SubAccounts>       SubAccounts       { get; set; }
		
		public FuneralCallDbContext( DbContextOptions<FuneralCallDbContext> options, IHttpContextAccessor httpContextAccessor ) : base( options )
		{
			_httpContextAccessor = httpContextAccessor;
		}

		public override int SaveChanges()
		{
			var  entities = ChangeTracker.Entries().Where( x => x.Entity is BaseModel ).ToList();
			bool isUser   = _httpContextAccessor.HttpContext.Items.ContainsKey( "Employee" );
			bool isClient = _httpContextAccessor.HttpContext.Items.ContainsKey( "ClientUser" );

			foreach( var entity in entities )
			{
				string current    = JsonConvert.SerializeObject( entity.Entity );
				string original   = null;

				if( entity.State == EntityState.Modified )
				{
					original = JsonConvert.SerializeObject( entity.GetDatabaseValues().ToObject() );
				}
				
				((BaseModel)entity.Entity).SaveChanges( entity.State );

				if( entity.State != EntityState.Unchanged )
				{
					// Log all activity
					TransactionLog transactionLog = new TransactionLog();

					transactionLog.transaction_type     = (int)entity.State;
					transactionLog.transaction_before   = original;
					transactionLog.transaction_after    = current;
					transactionLog.transaction_datetime = DateTime.UtcNow;

					if( isUser )
					{
						Employee employee = (Employee)_httpContextAccessor.HttpContext.Items["Employee"];

						transactionLog.transaction_account_id   = employee.id.Value;
						transactionLog.transaction_account_type = "Employee";
					}
					else if( isClient )
					{
						ClientUser clientUser = (ClientUser)_httpContextAccessor.HttpContext.Items["ClientUser"];

						transactionLog.transaction_account_id   = clientUser.id.Value;
						transactionLog.transaction_account_type = "ClientUser";
					}
					else // Some requests, i.e. reset password, has no logged in user ...
					{
						transactionLog.transaction_account_id   = -1;
						transactionLog.transaction_account_type = "NoUserLoggedIn";
					}

					this.TransactionLog.Add( transactionLog );
				}
			}

			return base.SaveChanges();
		}

		protected override void OnModelCreating( ModelBuilder modelBuilder )
		{
			modelBuilder.Entity<ClientUserDeletedMessage>()
			            .HasKey( cudm => new { cudm.client_user_id, cudm.message_id } );
		}
	}
}