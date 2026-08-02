namespace Happy2CleanAPI.Services;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendVerificationCodeAsync(string toEmail, string toName, string code)
    {
        var settings  = _config.GetSection("EmailSettings");
        var fromEmail = settings["FromEmail"] ?? "noreply@happy2clean.com";
        var fromName  = settings["FromName"]  ?? "Happy2Clean";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = code + " is your Happy2Clean verification code";

        message.Body = new TextPart("html")
        {
            Text = BuildEmailHtml(toName, code)
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(
            settings["SmtpHost"] ?? "smtp.gmail.com",
            int.Parse(settings["SmtpPort"] ?? "587"),
            SecureSocketOptions.StartTls
        );
        await client.AuthenticateAsync(
            settings["SmtpUser"] ?? "",
            settings["SmtpPass"] ?? ""
        );
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string BuildEmailHtml(string name, string code)
    {
        return @"<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #f5f6f4; margin: 0; padding: 40px 0; }
    .card { background: #fff; max-width: 480px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
    .header { background: #1a231e; padding: 32px; text-align: center; }
    .logo { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .logo span { color: #4caf8d; }
    .body { padding: 40px 32px; }
    .greeting { font-size: 16px; color: #1a231e; margin-bottom: 8px; }
    .desc { font-size: 14px; color: #738279; line-height: 1.6; margin-bottom: 32px; }
    .code-box { background: #f5f6f4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
    .code { font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #1a231e; }
    .expiry { font-size: 13px; color: #738279; margin-top: 8px; }
    .footer { padding: 24px 32px; border-top: 1px solid #f0f1ef; font-size: 12px; color: #aab8b2; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <div class='logo'>Happy2<span>Clean</span></div>
    </div>
    <div class='body'>
      <p class='greeting'>Hi NAME_PLACEHOLDER,</p>
      <p class='desc'>Use the code below to verify your email and create your Happy2Clean account. This code expires in <strong>10 minutes</strong>.</p>
      <div class='code-box'>
        <div class='code'>CODE_PLACEHOLDER</div>
        <div class='expiry'>Expires in 10 minutes</div>
      </div>
      <p class='desc' style='margin-bottom:0'>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class='footer'>
      &copy; Happy2Clean &middot; Helsinki, Finland<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>"
            .Replace("NAME_PLACEHOLDER", System.Net.WebUtility.HtmlEncode(name))
            .Replace("CODE_PLACEHOLDER", code);
    }
}
