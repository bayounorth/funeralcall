using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "ClientOfficeInfoForMsgApp" )]
	public class ClientOfficeInfo : BaseModel
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int OfficeID { get; set; }
		public string  AppLogInAcctNumber      { get; set; }
		public decimal AcctNum                 { get; set; }
		public string  ClientName              { get; set; }
		public string  ClientPassword          { get; set; }
		public string  ClientOfDivision        { get; set; }
		public string  ContactPageClientName1  { get; set; }
		public string  ContactPageFwdNumber1   { get; set; }
		public string  ContactPageERFwdNumber1 { get; set; }
	}
}