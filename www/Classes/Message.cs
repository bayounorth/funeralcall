namespace FuneralCallV2.Classes
{
	public class Message
	{
		private Message( string value ) { Value = value; }
		
		public string Value { get; set; }

	    public static Message RecordNotFound            => new Message( "Error, record not found." );
	    public static Message RecordSuccessfullyDeleted => new Message( "Record successfully deleted." );
	    public static Message UsernameUnique            => new Message( "The Username field must be unique." );
	    public static Message PasswordRequired          => new Message( "The Password field is required." ); 
	    public static Message PasswordInvalid           => new Message( "Invalid password, minimum of 8 characters required." );
	    public static Message Unauthorized              => new Message( "Unauthorized." );
	    public static Message Success                   => new Message( "Success." );
	    public static Message FieldRequired             => new Message( "This field is required." );
	    public static Message NotFound                  => new Message( "Not found." );
	    public static Message PasswordsNoMatch          => new Message( "Passwords do not match." );
	    public static Message AccountUnique             => new Message( "The Account Number field must be unique." );
	    public static Message OperationDenied           => new Message( "You are not authorized to perform this operation." );
	}
}