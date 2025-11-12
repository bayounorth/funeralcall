using System;
using System.Collections.Generic;

namespace FuneralCallV2.Models.ISWeb
{
	public class User
	{
		public string           ErrorMessage          { get; set; }
		public Int32            AgentId               { get; set; }
		public string           BrandingUrl           { get; set; }
		public IList<CustomTab> CustomTabs            { get; set; }
		public Boolean          Directory             { get; set; }
		public IList<Int32>     ImageIds              { get; set; }
		public Boolean          Inbox                 { get; set; }
		public IList<Listing>   Listings              { get; set; }
		public Boolean          OnCall                { get; set; }
		public Int32            SessionTimeout        { get; set; }
		public Boolean          SimpleMessageDispatch { get; set; }
		public Boolean          Status                { get; set; }
		public Int32            SubjectId             { get; set; }
		public Int32            ViewId                { get; set; }
	}
}