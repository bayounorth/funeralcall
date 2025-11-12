using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Data;

namespace FuneralCallV2.Models
{
	[Table( "Employee" )]
	public class Employee : BaseModel
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int?	id							{ get; set; }

		[Required]
		[StringLength( 32 )]
		public string   username				{ get; set; }
		
		[StringLength( 64 )]
		public string   password				{ get; set; }

		[Required]
		[Display( Name = "First Name" )]
		[StringLength( 64 )]
		public string   first_name				{ get; set; }

		[Required]
		[Display( Name = "Last Name" )]
		[StringLength( 64 )]
		public string   last_name				{ get; set; }

		[Required]
		public Boolean  is_active				{ get; set; }

		[Required]
		public Boolean  is_admin				{ get; set; }

		[Required] public Boolean is_supervisor	{ get; set; }
		[Required] public Boolean is_operator	{ get; set; }

		public override IEnumerable<ValidationResult> Validate( ValidationContext validationContext )
		{
			var     results  = new List<ValidationResult>();
			var     context  = (FuneralCallDbContext)validationContext.GetService( typeof( FuneralCallDbContext ) );
			Boolean isExists = false;
			
			// Check for unique username...
			if( this.id == 0 )
			{
				isExists = context.Employee.Any( user => user.username == this.username );
			}
			else
			{
				isExists = context.Employee.Any( user => ( user.username == this.username ) && ( user.id != id ) );
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