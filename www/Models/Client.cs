using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Data;

namespace FuneralCallV2.Models
{
	[Table( "client" )]
	public class Client : BaseModel
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int?      id                   { get; set; }
		
		[StringLength( 5 )]
		[Display( Name = "Account Number" )]
		public string    account_number       { get; set; }

		[Required]
		[StringLength( 256 )]
		[Display( Name = "Client Name" )]
		public string    client_name          { get; set; }

		[Required]
		[Display( Name = "Is Active" )]
		public bool      is_active            { get; set; }
		
		public override IEnumerable<ValidationResult> Validate( ValidationContext validationContext )
		{
			var     results  = new List<ValidationResult>();
			var     context  = (FuneralCallDbContext)validationContext.GetService( typeof( FuneralCallDbContext ) );
			Boolean isExists = false;

			// Check for account number on new clients only...
			if( this.id == 0 )
			{
				if( ( this.account_number == null ) || ( this.account_number.Length == 0 ) )
				{
					results.Add( new ValidationResult( Message.FieldRequired.Value, new[] { nameof( account_number ) } ) );

					return results;
				}
			}
			
			// Check for unique account number...
			if( this.id == 0 )
			{
				isExists = context.Client.Any( user => user.account_number == this.account_number );
			}
			else
			{
				isExists = context.Client.Any( user => ( user.account_number == this.account_number ) && ( user.id != id ) );
			}

			if( isExists == true )
			{
				results.Add( new ValidationResult( Message.UsernameUnique.Value, new[] { nameof( account_number ) } ) );
			}

			return results;
		}
	}
}