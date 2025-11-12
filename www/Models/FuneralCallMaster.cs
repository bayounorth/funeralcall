using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "tbl_FuneralCallMaster" )]
	public class FuneralCallMaster : BaseModel
	{
		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public Int64	 RecordID				  { get; set; }
		public string    CastType                 { get; set; }
		public string    DecName                  { get; set; }
		public string    Age                      { get; set; }
		public DateTime? DOD                      { get; set; }
		public string    Chapel                   { get; set; }
		public string    LivedAt                  { get; set; }
		public DateTime? VisitationDate           { get; set; }
		public string    VisitationTime           { get; set; }
		public string    VisitationLocation       { get; set; }
		public string    Rosary                   { get; set; }
		public DateTime? ServiceDate              { get; set; }
		public string    ServiceTime              { get; set; }
		public string    ServiceLocation          { get; set; }
		public string    Mass                     { get; set; }
		public string    BurialLocation           { get; set; }
		public string    BurialAddress            { get; set; }
		public string    BurialDirections         { get; set; }
		public string    Shiva                    { get; set; }
		public string    ShivaDirections          { get; set; }
		public string    Flowers                  { get; set; }
		public string    Memorials                { get; set; }
		public DateTime? PastService              { get; set; } 
		public Boolean?  IsPurged                 { get; set; }
		public string    NOK                      { get; set; }
		public string    OtherInfo                { get; set; }
		public string    StampInitial             { get; set; }
		public DateTime? StampTime                { get; set; } 
		public Int64?    CreatedBy                { get; set; } 
		public DateTime? CreateDate               { get; set; } 
		public Int64?    ModifiedBy               { get; set; } 
		public DateTime? ModifiedDate             { get; set; } 
		public Boolean?  IsActive                 { get; set; } 
		public string    Trisagionservice         { get; set; } 
		public DateTime? SecondVisitationDate     { get; set; } 
		public string    SecondVisitationTime     { get; set; } 
		public string    SecondVisitationLocation { get; set; }
		public string    OtherServices            { get; set; }
	}
}