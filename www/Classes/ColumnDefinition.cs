namespace FuneralCallV2.Classes
{
	public class ColumnDefinition
	{
		public string column_name        { get; set; }
		public string type_name          { get; set; }
		public int    max_length         { get; set; }
		public bool   is_nullable        { get; set; }
		public bool   is_identity        { get; set; }
		public string column_description { get; set; }
		public bool   is_editable        { get; set; }
		public bool   is_visible         { get; set; }
		public int    sequence           { get; set; }
		public int    column_width       { get; set; }
		public string options            { get; set; }
		public string display_when       { get; set; }
		public bool   is_grid_table      { get; set; }
		public string default_value      { get; set; }
		public bool   is_required        { get; set; }
	}
}