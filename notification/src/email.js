import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        type: "Oauth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.log("Authentication email failed:",error);
    }
    else{
        console.log("Server is ready to take our messages");
    }
})


export const sendEmail = async (to, subject, text, html) =>{
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        })
        console.log("Email sent:", info.messageId)
    } catch (error) {
        console.log("Error sending email:", error)
    }
}
