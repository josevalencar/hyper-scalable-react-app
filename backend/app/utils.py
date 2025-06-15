import os
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def send_email(to_email: str, subject: str, body: str, otp_code: str = None):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_pass:
        print("SMTP credentials not set. Email not sent.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    # Insiread theme HTML
    if otp_code:
        html_content = f'''
        <div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
          <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 16px #0001;padding:32px 24px;">
            <h1 style="color:#4f46e5;font-size:2.2rem;font-weight:700;margin-bottom:8px;text-align:center;letter-spacing:1px;">Insiread Password Reset</h1>
            <p style="color:#333;font-size:1.1rem;text-align:center;margin-bottom:24px;">Use the code below to reset your password. This code is valid for 10 minutes.</p>
            <div style="background:#f1f5ff;color:#4f46e5;font-size:2.4rem;font-weight:700;letter-spacing:8px;text-align:center;padding:18px 0;border-radius:12px;margin-bottom:24px;border:2px dashed #4f46e5;">
              {otp_code}
            </div>
            <p style="color:#555;font-size:1rem;text-align:center;margin-bottom:0;">If you did not request this, you can ignore this email.</p>
            <div style="margin-top:32px;text-align:center;color:#aaa;font-size:0.9rem;">&copy; {datetime.utcnow().year} Insiread</div>
          </div>
        </div>
        '''
        msg.set_content(f"Your OTP code is: {otp_code}\n\nIf you did not request this, you can ignore this email.")
        msg.add_alternative(html_content, subtype="html")
    else:
        msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}") 