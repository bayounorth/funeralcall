using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "aspnet_Membership" )]
	public class AspNetMembership
	{
		[Required]
		public Guid     ApplicationId                          { get; set; }

		[Key]
		[Required]
		public Guid     UserId                                 { get; set; }

		[Required]
		[StringLength( 128 )]
		public string   Password                               { get; set; }

		[Required]
		public Int32    PasswordFormat                         { get; set; }

		[Required]
		[StringLength( 128 )]
		public string   PasswordSalt                           { get; set; }

		[StringLength( 16 )]
		public string   MobilePIN                              { get; set; }

		[Required]
		[StringLength( 256 )]
		public string   Email                                  { get; set; }

		[Required]
		[StringLength( 256 )]
		public string   LoweredEmail                           { get; set; }

		[Required]
		[StringLength( 256 )]
		public string   PasswordQuestion                       { get; set; }

		[Required]
		[StringLength( 128 )]
		public string   PasswordAnswer                         { get; set; }

		[Required]
		public Boolean  IsApproved                             { get; set; }

		[Required]
		public Boolean  IsLockedOut                            { get; set; }

		[Required]
		public DateTime CreateDate                             { get; set; }

		[Required]
		public DateTime LastLoginDate                          { get; set; }

		[Required]
		public DateTime LastPasswordChangedDate                { get; set; }

		[Required]
		public DateTime LastLockoutDate                        { get; set; }

		[Required]
		public Int32    FailedPasswordAttemptCount             { get; set; }

		[Required]
		public DateTime FailedPasswordAttemptWindowStart       { get; set; }

		[Required]
		public Int32    FailedPasswordAnswerAttemptCount       { get; set; }

		[Required]
		public DateTime FailedPasswordAnswerAttemptWindowStart { get; set; }

		public string   Comment                                { get; set; }
	}
}