using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "SubAccounts" )]
	public class SubAccounts
	{
		[Key]
		[Required] 
		public Int64	 RecordID				{ get; set; }
		
		[Required]
		public Int64	 MainAccountUsername	{ get; set; } 
		
		[StringLength( 50 )]
		public string	 Username				{ get; set; }

		[StringLength( 60 )]
		public string    Password				{ get; set; }

		[Required]
		public Boolean   IsActive				{ get; set; }
		
		[StringLength( 100 )]
		public string    FirstName				{ get; set; }
		
		[StringLength( 100 )]
		public string    LastName				{ get; set; }
		
		public DateTime? CreateDate				{ get; set; }
		
		public DateTime? ModifiedDate			{ get; set; }

		[StringLength( 50 )]
		public string    OfficeNumber			{ get; set; }

		[StringLength( 50 )]
		public string    CellPhoneNumber		{ get; set; }

	}
}
