const nodemailer = require("nodemailer")
const { generalLogger } = require("./utils/generalLogger")
require('dotenv').config()
const validateEmail = require("./utils/emailValidator")

async function sendContactEmail(req, res) {
    const { fullName, email, subject, description } = req.body

    let mailTransporter = nodemailer.createTransport({
        name: "NoosaEngage",
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    if (!fullName || !email || !subject || !description) {
        generalLogger.error("Cannot send email")
        generalLogger.debug("one or more field is missing")
        return res.status(400).send({ message: "Error: All fields must be completed" })
    }

    if (!validateEmail(email)) {
        generalLogger.error("Invalid email address: " + email)
        return res.status(400).send({ message: "Please enter a valid email address" })
    }

    // Email to Noosa Engage (internal)
    let internalEmailDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `New Contact Form Submission - ${subject}`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Contact Form Submission</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f9fafb;
                        color: #333333;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #0A3755;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                    }
                    .field {
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .field:last-child {
                        border-bottom: none;
                    }
                    .field-label {
                        font-weight: bold;
                        color: #0A3755;
                        margin-bottom: 5px;
                    }
                    .field-value {
                        color: #333333;
                        line-height: 1.6;
                    }
                    .message-box {
                        background-color: #f9fafb;
                        padding: 15px;
                        border-radius: 5px;
                        border-left: 4px solid #0A3755;
                    }
                    .footer {
                        background-color: #f9fafb;
                        padding: 15px 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #6b7280;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Contact Form Submission</h1>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="field-label">From:</div>
                            <div class="field-value">${fullName}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Email:</div>
                            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                        <div class="field">
                            <div class="field-label">Subject:</div>
                            <div class="field-value">${subject}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Message:</div>
                            <div class="message-box">
                                ${description.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div class="field">
                            <div class="field-label">Submitted:</div>
                            <div class="field-value">${new Date().toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="footer">
                        Reply directly to ${email} to respond to this inquiry.
                    </div>
                </div>
            </body>
            </html>
        `
    }

    // Auto-reply email to the user
    let autoReplyDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: "Thank you for contacting Noosa Engage - We've received your message",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Thank You - Noosa Engage</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f9fafb;
                        color: #333333;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #0A3755, #1e5f8b);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .highlight {
                        background-color: #f0f9ff;
                        padding: 20px;
                        border-radius: 5px;
                        border-left: 4px solid #0A3755;
                        margin: 20px 0;
                    }
                    .contact-info {
                        background-color: #f9fafb;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        background-color: #0A3755;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        font-size: 14px;
                    }
                    .footer a {
                        color: #93c5fd;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thank You for Contacting Us!</h1>
                        <p>We've received your message and will get back to you soon.</p>
                    </div>
                    <div class="content">
                        <p>Dear ${fullName},</p>
                        
                        <p>Thank you for reaching out to Noosa Engage! We have successfully received your message regarding "<strong>${subject}</strong>" and truly appreciate you taking the time to contact us.</p>
                        
                        <div class="highlight">
                            <strong>What happens next?</strong>
                            <ul>
                                <li>Our team will review your message within 24 hours</li>
                                <li>You'll receive a personalized response to address your specific needs</li>
                                <li>If needed, we'll schedule a consultation to discuss your tutoring goals</li>
                            </ul>
                        </div>
                        
                        <p>In the meantime, feel free to explore our website to learn more about our tutoring services, meet our expert instructors, and discover how we can help you achieve your academic goals.</p>
                        
                        <div class="contact-info">
                            <strong>Need immediate assistance?</strong><br>
                            📞 Phone: <a href="tel:+15744064727">+1 (574) 406-4727</a><br>
                            📧 Email: <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
                            🌐 Website: <a href="https://www.noosaengage.com">www.noosaengage.com</a>
                        </div>
                        
                        <p>We're excited about the opportunity to support your learning journey!</p>
                        
                        <p>Best regards,<br>
                        <strong>The Noosa Engage Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated response. Please do not reply to this email.</p>
                        <p>Visit us at <a href="https://www.noosaengage.com">www.noosaengage.com</a> | Follow us on social media</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }

    try {
        // Send internal email
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(internalEmailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send internal email: " + error)
                    reject(error)
                } else {
                    generalLogger.info("Internal email sent successfully")
                    resolve(info)
                }
            })
        })

        // Send auto-reply email
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(autoReplyDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send auto-reply email: " + error)
                    reject(error)
                } else {
                    generalLogger.info("Auto-reply email sent successfully to: " + email)
                    resolve(info)
                }
            })
        })

        generalLogger.info("Contact form submission processed successfully from: " + email)
        return res.status(200).send({ 
            message: "Thank you for your message! We've received your inquiry and will respond within 24 hours." 
        })

    } catch (error) {
        generalLogger.error("Error sending contact emails: " + error)
        return res.status(500).send({ 
            message: "Thank you for your message! We've received it and will get back to you soon." 
        })
    }
}
module.exports = { sendContactEmail }