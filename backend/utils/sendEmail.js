const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
};

module.exports = sendEmail;