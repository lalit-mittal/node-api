const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

sgMail.setApiKey(process.env.SENDGRID_SECRET);

exports.sendSignupMail = (email, userid, verificationToken) => {
  try {
    const link = `http://localhost:${process.env.PORT}/auth/user/verify?userId=${userid}&token=${verificationToken}`;
    sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Signup successful",
      html: `<html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                </head>
                <body style="font-family: Arial, sans-serif;">

                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2>Email Verification</h2>
                        <p>Dear User,</p>
                        <p>
                            Thank you for signing up. To complete your registration, please verify your email address by clicking on the link below:
                        </p>
                        <p>
                        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Verify Email Address</a>
                        </p>
                        <p>If you did not request this, please ignore this email.</p>
                        <p>Regards,<br>Your App Team</p>
                    </div>

                </body>
                </html>`,
    });
  } catch (error) {
    console.log(error);
  }
};
