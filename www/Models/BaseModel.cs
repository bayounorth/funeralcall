using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace FuneralCallV2.Models
{
	public class BaseModel : IValidatableObject
	{
		public virtual IEnumerable<ValidationResult> Validate( ValidationContext validationContext )
		{
			return new List<ValidationResult>();
		}

		public virtual void SaveChanges( EntityState state ){}
	}
}