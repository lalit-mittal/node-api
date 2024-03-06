const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv')

sgMail.setApiKey(process.env.SENDGRID_SECRET)

const sendSignupMail = (email, userid) => {
    const link = "<a href='http://localhost:3000/auth/user/verify'" + userid + ">Verify</a>"
    sgMail.send({
        to: email,
        from: 'mittallalit1995@gmail.com',
        subject: 'Signup successful',
        text: `You have successfully signed up. Please verify your email by clicking the link ${link}`
    })
}
