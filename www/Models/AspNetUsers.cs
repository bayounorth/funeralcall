using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "aspnet_Users" )]
	public class AspNetUsers
	{
		[Required]
		public Guid     ApplicationId    { get; set; }

		[Key]
		[Required]
		public Guid     UserId           { get; set; }

		[Required]
		[StringLength( 256 )]
		public string   UserName         { get; set; }

		[Required]
		[StringLength( 256 )]
		public string   LoweredUserName  { get; set; }

		[StringLength( 16 )]
		public string   MobileAlias      { get; set; }

		[Required]
		public Boolean  IsAnonymous      { get; set; }

		[Required]
		public DateTime LastActivityDate { get; set; }
	}
}
