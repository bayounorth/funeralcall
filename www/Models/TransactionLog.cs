using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "transaction_log" )]
	public class TransactionLog
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int      id                       { get; set; }
		public DateTime transaction_datetime     { get; set; }
		public int      transaction_account_id   { get; set; }
		public string   transaction_account_type { get; set; }
		public int      transaction_type         { get; set; }
		public string   transaction_before       { get; set; }
		public string   transaction_after        { get; set; }
	}
}