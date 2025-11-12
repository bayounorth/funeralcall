using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FuneralCallV2
{
	public class Startup
	{
		public Startup( IConfiguration configuration )
		{
			Configuration = configuration;
			StaticConfig  = configuration;
		}

		public        IConfiguration Configuration { get; }
		public static IConfiguration StaticConfig  { get; private set; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices( IServiceCollection services )
		{
			services.AddCors();
			
			services.AddDbContext<FuneralCallDbContext>( options => options.UseSqlServer( Configuration.GetConnectionString( "FuneralCall" ) ) );
			services.AddDbContext<CustomerDatabasesDbContext>( options => options.UseSqlServer( Configuration.GetConnectionString( "CustomerDatabases" ) ) );

			services.AddControllers().AddNewtonsoftJson();
			
			services.AddControllers();

			// In production, the React files will be served from this directory
			services.AddSpaStaticFiles( configuration => { configuration.RootPath = "ClientApp/build"; } );

			services.Configure<ApiBehaviorOptions>( options => { options.SuppressModelStateInvalidFilter = true; } );

			services.AddScoped<IAuthorizationService, AuthorizationService>();

			var emailConfig = Configuration
			                  .GetSection( "EmailConfiguration" )
			                  .Get<EmailConfiguration>();
			services.AddSingleton( emailConfig );
			services.AddScoped<IEmailSender, EmailSender>();

			services.AddHttpContextAccessor();
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure( IApplicationBuilder app, IWebHostEnvironment env )
		{
			app.UseStatusCodePagesWithReExecute( "/error/{0}" );
			app.UseExceptionHandler( "/error" );
			
			if( env.IsDevelopment() )
			{
			}
			else
			{
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();
			app.UseSpaStaticFiles();

			app.UseRouting();

			app.UseCors( x => x
			                  .AllowAnyOrigin()
			                  .AllowAnyMethod()
			                  .AllowAnyHeader() );

			app.UseMiddleware<JwtMiddleware>();

			app.UseEndpoints( endpoints => { endpoints.MapControllers(); } );

			app.UseSpa( spa =>
			            {
				            spa.Options.SourcePath = "ClientApp";

				            if( env.IsDevelopment() )
				            {
					            spa.UseReactDevelopmentServer( "start" );
				            }
			            } );
		}
	}
}