using System;
using System.Net.Http;
using System.Threading.Tasks;
using FuneralCallV2.Models.ISWeb;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace FuneralCallV2.Classes
{
	public class ISWeb
	{
		public static async Task<User> Login( string username, string password )
		{
			User user = null;

			using ( var client = new HttpClient() )
			{
				string url         = String.Format( "{0}/Login/{1}/{2}", Startup.StaticConfig.GetValue<string>( "ISWeb" ), username, password );
				var    uri         = new Uri( url );
				var    response    = await client.GetAsync( uri );
				string apiResponse = await response.Content.ReadAsStringAsync();

				user = JsonConvert.DeserializeObject<User>( apiResponse );
			}

			return user;
		}
	}
}