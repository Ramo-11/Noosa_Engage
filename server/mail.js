const nodemailer = require("nodemailer")

async function sendEmail(req, res) {
    const { fullName, email, subject, description } = req.body

    if (!fullName || !email || !subject || !description) {
        generalLogger.error("Cannot send email")
        generalLogger.debug("one or more field is missing")
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
            generalLogger.info("Email was sent successfully")
            return res.status(200).send({ message: "Email was sent successfully" })
        } else {
            generalLogger.error("Cannot send email")
            generalLogger.debug(error)
            return res.status(400).send({ message: "Email was not sent" })
        }
    })
}

module.exports = sendEmail