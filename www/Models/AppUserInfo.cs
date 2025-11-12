using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "AppUserInfo" )]
	public class AppUserInfo
	{
		public string UserName         { get; set; }

		[Key]
		public string UUID             { get; set; }
		
		public string DeletedMessages  { get; set; }
		public string FavoriteContacts { get; set; }
	}
}