export function generateOTP(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPHtml(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background: #f5f7fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #111827;
">
  <div style="padding: 40px 16px;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width: 520px; margin: 0 auto;"
    >
      <tr>
        <td>
          <!-- Card -->
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 40px 32px;
            text-align: center;
          ">

            <!-- Logo / Brand -->
            <div style="
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 32px;
            ">
              App Name
            </div>

            <!-- Heading -->
            <h1 style="
              margin: 0 0 12px;
              font-size: 28px;
              line-height: 1.3;
              font-weight: 700;
              color: #111827;
            ">
              Verify your email
            </h1>

            <p style="
              margin: 0 auto 28px;
              max-width: 400px;
              font-size: 15px;
              line-height: 1.6;
              color: #6b7280;
            ">
              Use the verification code below to continue.
              This code will expire in 10 minutes.
            </p>

            <!-- OTP -->
            <div style="
              display: inline-block;
              padding: 16px 28px;
              margin-bottom: 28px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              font-size: 32px;
              line-height: 1;
              font-weight: 700;
              letter-spacing: 8px;
              color: #111827;
            ">
              ${otp}
            </div>

            <p style="
              margin: 0;
              font-size: 13px;
              line-height: 1.6;
              color: #9ca3af;
            ">
              If you didn't request this code, you can safely ignore
              this email.
            </p>

          </div>

          <!-- Footer -->
          <p style="
            margin: 20px 0 0;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          ">
            © ${new Date().getFullYear()} Your App. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
