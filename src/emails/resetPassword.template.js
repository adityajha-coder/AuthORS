
export function getPasswordResetHtml(resetLink, userName = "User") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827;">
  <div style="padding: 40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; margin: 0 auto;">
      <tr>
        <td>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 24px;">AuthORS</div>
            <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; font-weight: 700; color: #111827;">Reset Your Password</h1>
            <p style="margin: 0 auto 24px; max-width: 400px; font-size: 14px; line-height: 1.6; color: #6b7280;">Hello <strong>${userName}</strong>, we received a request to reset your password. Click the button below to set a new password:</p>
            
            <div style="margin: 28px 0;">
              <a href="${resetLink}" target="_blank" style="background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
            </div>

            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9ca3af;">This link will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          </div>
          <p style="margin: 20px 0 0; text-align: center; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} AuthORS. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
