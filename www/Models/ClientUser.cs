using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Data;

namespace FuneralCallV2.Models
{
	[Table( "client_user" )]
	public class ClientUser : BaseModel
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int?      id                   { get; set; }

		public int		 client_id			  { get; set; }

		[Required]
		[StringLength( 32 )]
		[Display( Name = "Username" )]
		public string    username             { get; set; }

		[StringLength( 64 )]
		[Display( Name = "Password" )]
		public string    password             { get; set; }

		[StringLength( 128 )]
		public string    password_reset_token { get; set; }

		[StringLength( 128 )]
		[Display( Name = "Email Address" )]
		public string    email_address        { get; set; }

		[Required]
		[StringLength( 64 )]
		[Display( Name = "First Name" )]
		public string    first_name           { get; set; }

		[Required]
		[StringLength( 64 )]
		[Display( Name = "Last Name" )]
		public string    last_name            { get; set; }

		[StringLength( 10 )]
		[Display( Name = "Office Number" )]
		public string	 office_number		  { get; set; }

		[StringLength( 10 )]
		[Display( Name = "Cell Phone Number" )]
		public string	 cell_phone_number	  { get; set; }

		[Required]
		[Display( Name = "Is Active" )]
		public bool      is_active            { get; set; }

		[StringLength( 256 )]
		[Display( Name = "Notification Token" )]
		public string	 app_token			  { get; set; }

		[Display( Name = "Notifications" )]
		public bool		 notifications		  { get; set; }

		[StringLength( 64 )]
		[Display( Name = "Standard Sound" )]
		public string	 standard_sound		  { get; set; }

		[StringLength( 64 )]
		[Display( Name = "FirstCall Sound" )]
		public string	 firstcall_sound	  { get; set; }

		public override IEnumerable<ValidationResult> Validate( ValidationContext validationContext )
		{
			var     results  = new List<ValidationResult>();
			var     context  = (FuneralCallDbContext)validationContext.GetService( typeof( FuneralCallDbContext ) );
			Boolean isExists = false;
			
			// Check for unique username...
			if( this.id == 0 )
			{
				isExists = context.ClientUser.Any( user => user.username == this.username );
			}
			else
			{
				isExists = context.ClientUser.Any( user => ( user.username == this.username ) && ( user.id != id ) );
			}

			if( isExists == true )
			{
				results.Add( new ValidationResult( Message.UsernameUnique.Value, new[] { nameof( username ) } ) );
			}
			
			// Check for password, if new record...
			if( this.id == 0 )
			{
				if( string.IsNullOrEmpty( this.password ) == true )
				{
					results.Add( new ValidationResult( Message.PasswordRequired.Value, new[] { nameof( password ) } ) );
				}
			}

			return results;
		}
	}
}