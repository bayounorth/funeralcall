using System;
using System.IO;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace FuneralCallV2
{
	public class Program
	{
		public static void Main( string[] args )
		{
			FirebaseApp.Create( new AppOptions(){ Credential = GoogleCredential.FromFile( Path.Combine( AppDomain.CurrentDomain.BaseDirectory, "key.json" ) ) } );
			
			CreateHostBuilder( args ).Build().Run();
		}

		public static IHostBuilder CreateHostBuilder( string[] args )
		{
			return Host.CreateDefaultBuilder( args )
			           .ConfigureWebHostDefaults( webBuilder => { webBuilder.UseStartup<Startup>(); } );
		}
	}
}