using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FuneralCallV2.Models
{
	[Table( "client_user_deleted_message" )]
	[Index( nameof( client_user_id ), nameof( message_id ) )]
	[Keyless]
	public class ClientUserDeletedMessage : BaseModel
	{
		public int client_user_id { get; set; }
		public int message_id     { get; set; }
	}
}