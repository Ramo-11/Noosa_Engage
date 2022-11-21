const nodemailer = require("nodemailer")

async function sendEmail(req, res) {
    const { fullName, email, subject, description } = req.body

    if (!fullName || !email || !subject || !description) {
        return res.status(400).send({ message: "Error: All fields must be completed" })
    }

    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "omarh5877@gmail.com",
            pass: "ptthrosqnestbmtu"
        }
    })

    let details = {
        from: email,
        to: "noosa@noosaengage.com", 
        subject: `Message from ${fullName}: subject: ${subject}`,
        text: description
    }

    mailTransporter.sendMail(details, (error) => {
        if (!error) { 
            return res.status(200).send({ message: "Message was sent successfully" })
        } else {
            return res.status(400).send({ message: "Message was not sent" })
        }
    })
}

module.exports = sendEmail