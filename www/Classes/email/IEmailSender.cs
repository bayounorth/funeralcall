using System.Threading.Tasks;

namespace FuneralCallV2.Classes.email
{
	public interface IEmailSender
	{
		EmailConfiguration EmailConfig { get; }
		void               SendEmail( EmailMessage      message );
		Task               SendEmailAsync( EmailMessage message );
	}
}