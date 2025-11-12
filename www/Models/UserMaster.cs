using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "tbl_UserMaster" )]
	public class UserMaster
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public Int64?    UserID      { get; set; }

		[Required]
		public Guid      UserToken   { get; set; }

		[Required]
		[StringLength( 100 )]
		public string    FirstName   { get; set; }

		[Required]
		[StringLength( 100 )]
		public string    LastName    { get; set; }
		
		public Int64?    CreatedBy   { get; set; }
		
		public DateTime? CreatedDate { get; set; }
		
		public Int64?    UpdatedBy   { get; set; }
		
		public DateTime? UpdatedDate { get; set; }

		[Required]
		public Boolean   IsActive    { get; set; }
	}
}
