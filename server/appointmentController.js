const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { generalLogger } = require('./utils/generalLogger')
const nodemailer = require("nodemailer");

async function processInitialAppointmentRequest(req, res) {
    try {
        const { course, preferredDays, preferredTime, notes, user } = await validateInitialAppointmentRequest(req)
        
        // Send email to admin with the request details
        sendAppointmentRequestToAdmin(user.fullName, user.email, course, preferredDays, preferredTime, notes)
        
        generalLogger.info(`Appointment request submitted by user: ${user.email} for course: ${course}`)
        return res.status(200).send({ 
            message: "Your session request has been submitted successfully! We'll contact you within 24 hours to confirm your appointment." 
        })

    } catch (err) {
        generalLogger.error("Error processing appointment request:", err.message)
        return res.status(400).send({ message: err.message })
    }
}

async function validateInitialAppointmentRequest(req) {
    const { course, preferredDays, preferredTime, notes } = req.body

    if (!course || !preferredDays || !preferredTime) {
        throw new Error("Error: Please fill in all required fields")
    }

    if (!Array.isArray(preferredDays) || preferredDays.length === 0) {
        throw new Error("Error: Please select at least one preferred day")
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
        throw new Error("User not found")
    }

    return { course, preferredDays, preferredTime, notes: notes || '', user }
}

// Updated appointment confirmation email function
async function sendAppointmentConfirmationEmail(fullName, course, date, time, email) {
    let mailTransporter = nodemailer.createTransport({
        name: "NoosaEngage",
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Email to the user (confirmation)
    let userEmailDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Session Confirmed - ${course} | Noosa Engage`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Session Confirmation</title>
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
                    .session-details {
                        background-color: #f0fdf4;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #22c55e;
                        margin: 20px 0;
                    }
                    .session-details h3 {
                        color: #166534;
                        margin-top: 0;
                        margin-bottom: 15px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #dcfce7;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #166534;
                    }
                    .next-steps {
                        background-color: #eff6ff;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #3b82f6;
                        margin: 20px 0;
                    }
                    .next-steps h4 {
                        color: #1d4ed8;
                        margin-top: 0;
                    }
                    .next-steps ul {
                        color: #1e40af;
                        margin: 0;
                        padding-left: 20px;
                    }
                    .important-note {
                        background-color: #fefce8;
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid #eab308;
                        margin: 20px 0;
                    }
                    .contact-info {
                        background-color: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
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
                        <h1>🎉 Session Confirmed!</h1>
                        <p>We're excited to help you achieve your learning goals</p>
                    </div>
                    <div class="content">
                        <p>Dear ${fullName},</p>
                        
                        <p>Great news! Your tutoring session has been successfully confirmed. We're looking forward to working with you and helping you excel in your studies.</p>
                        
                        <div class="session-details">
                            <h3>📅 Session Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span>${course}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Time:</span>
                                <span>${time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Format:</span>
                                <span>Online via Video Call</span>
                            </div>
                        </div>
                        
                        <div class="next-steps">
                            <h4>🚀 What's Next?</h4>
                            <ul>
                                <li>You'll receive a meeting link 15 minutes before your session</li>
                                <li>Prepare any questions or materials you'd like to cover</li>
                                <li>Ensure you have a stable internet connection and quiet environment</li>
                                <li>Test your camera and microphone beforehand</li>
                                <li>Have a notebook and pen ready for taking notes</li>
                            </ul>
                        </div>
                        
                        <div class="important-note">
                            <p style="margin: 0; color: #a16207;"><strong>⚠️ Need to reschedule?</strong> Please contact us at least 24 hours in advance to avoid any cancellation fees.</p>
                        </div>
                        
                        <div class="contact-info">
                            <strong>Questions? We're here to help!</strong><br>
                            📞 Phone: <a href="tel:+15744064727">+1 (574) 406-4727</a><br>
                            📧 Email: <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
                            🌐 Website: <a href="https://www.noosaengage.com">www.noosaengage.com</a>
                        </div>
                        
                        <p>We're committed to providing you with an exceptional learning experience. See you soon!</p>
                        
                        <p>Best regards,<br>
                        <strong>The Noosa Engage Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>Get ready to unlock your potential with personalized tutoring!</p>
                        <p>Visit us at <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    // Email to Noosa Engage (internal notification)
    let internalEmailDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `New Session Booked - ${course} with ${fullName}`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>New Session Booking</title>
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
                    .booking-details {
                        background-color: #f0f9ff;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #0A3755;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #e0e7ff;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #0A3755;
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
                        <h1>📚 New Session Booking</h1>
                    </div>
                    <div class="content">
                        <p>A new tutoring session has been booked!</p>
                        
                        <div class="booking-details">
                            <h3 style="color: #0A3755; margin-top: 0;">Session Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Student:</span>
                                <span>${fullName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span><a href="mailto:${email}">${email}</a></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span>${course}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Time:</span>
                                <span>${time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Booked:</span>
                                <span>${new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <p><strong>Action Required:</strong> Please prepare for the session and send the meeting link 15 minutes before the scheduled time.</p>
                    </div>
                    <div class="footer">
                        <p>Noosa Engage - Internal Notification System</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        // Send confirmation email to user
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(userEmailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send user confirmation email: " + error);
                    reject(error);
                } else {
                    generalLogger.info("Confirmation email sent to user: " + email);
                    resolve(info);
                }
            });
        });

        // Send notification email to Noosa Engage
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(internalEmailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send internal notification email: " + error);
                    reject(error);
                } else {
                    generalLogger.info("Internal notification email sent for booking: " + fullName);
                    resolve(info);
                }
            });
        });

        generalLogger.info(`Appointment confirmation emails sent for ${fullName} - ${course}`);
    } catch (error) {
        generalLogger.error("Error sending appointment confirmation emails: " + error);
        throw error;
    }
}

// New function for appointment cancellation emails
async function sendAppointmentCancellationEmail(fullName, course, date, time, email) {
    let mailTransporter = nodemailer.createTransport({
        name: "NoosaEngage",
        service: "gmail",
        auth: {
            user: "noosa@noosaengage.com",
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Email to the user (cancellation confirmation)
    let userEmailDetails = {
        from: "noosa@noosaengage.com",
        to: email,
        subject: `Session Cancelled - ${course} | Noosa Engage`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Session Cancellation</title>
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
                        background: linear-gradient(135deg, #dc2626, #ef4444);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .cancelled-details {
                        background-color: #fef2f2;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #ef4444;
                        margin: 20px 0;
                    }
                    .cancelled-details h3 {
                        color: #dc2626;
                        margin-top: 0;
                        margin-bottom: 15px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #fecaca;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #dc2626;
                    }
                    .rebook-section {
                        background-color: #f0fdf4;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #22c55e;
                        margin: 20px 0;
                    }
                    .rebook-section h4 {
                        color: #166534;
                        margin-top: 0;
                    }
                    .contact-info {
                        background-color: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
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
                        <h1>Session Cancelled</h1>
                        <p>Your tutoring session has been cancelled</p>
                    </div>
                    <div class="content">
                        <p>Dear ${fullName},</p>
                        
                        <p>We've received your request to cancel your upcoming tutoring session. Your cancellation has been processed successfully.</p>
                        
                        <div class="cancelled-details">
                            <h3>📅 Cancelled Session Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span>${course}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date:</span>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Time:</span>
                                <span>${time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Cancelled:</span>
                                <span>${new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div class="rebook-section">
                            <h4>🔄 Ready to Reschedule?</h4>
                            <p>We understand that sometimes plans change. We'd love to help you find a new time that works better for you!</p>
                            <ul style="color: #166534; margin: 0; padding-left: 20px;">
                                <li>Visit our website to book a new session</li>
                                <li>Contact us directly for personalized scheduling</li>
                                <li>Browse our available tutors and subjects</li>
                            </ul>
                        </div>
                        
                        <div class="contact-info">
                            <strong>Questions or need help rescheduling?</strong><br>
                            📞 Phone: <a href="tel:+15744064727">+1 (574) 406-4727</a><br>
                            📧 Email: <a href="mailto:noosa@noosaengage.com">noosa@noosaengage.com</a><br>
                            🌐 Website: <a href="https://www.noosaengage.com">www.noosaengage.com</a>
                        </div>
                        
                        <p>We hope to see you back soon and continue supporting your learning journey!</p>
                        
                        <p>Best regards,<br>
                        <strong>The Noosa Engage Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>We're always here when you're ready to learn!</p>
                        <p>Visit us at <a href="https://www.noosaengage.com">www.noosaengage.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    // Email to Noosa Engage (internal notification)
    let internalEmailDetails = {
        from: "noosa@noosaengage.com",
        to: "noosa@noosaengage.com",
        subject: `⚠️ Session Cancelled - ${course} with ${fullName}`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Session Cancellation</title>
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
                        background-color: #dc2626;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 30px;
                    }
                    .cancellation-details {
                        background-color: #fef2f2;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #dc2626;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #fecaca;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #dc2626;
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
                        <h1>⚠️ Session Cancellation</h1>
                    </div>
                    <div class="content">
                        <p>A tutoring session has been cancelled by the student.</p>
                        
                        <div class="cancellation-details">
                            <h3 style="color: #dc2626; margin-top: 0;">Cancelled Session Information</h3>
                            <div class="detail-row">
                                <span class="detail-label">Student:</span>
                                <span>${fullName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span><a href="mailto:${email}">${email}</a></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Subject:</span>
                                <span>${course}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Scheduled Date:</span>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Scheduled Time:</span>
                                <span>${time}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Cancelled:</span>
                                <span>${new Date().toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <p><strong>Action Required:</strong></p>
                        <ul>
                            <li>Update the internal calendar/schedule</li>
                            <li>Notify the assigned tutor</li>
                            <li>Follow up with the student if appropriate</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Noosa Engage - Internal Notification System</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        // Send cancellation confirmation to user
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(userEmailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send user cancellation email: " + error);
                    reject(error);
                } else {
                    generalLogger.info("Cancellation email sent to user: " + email);
                    resolve(info);
                }
            });
        });

        // Send notification email to Noosa Engage
        await new Promise((resolve, reject) => {
            mailTransporter.sendMail(internalEmailDetails, (error, info) => {
                if (error) {
                    generalLogger.error("Failed to send internal cancellation email: " + error);
                    reject(error);
                } else {
                    generalLogger.info("Internal cancellation notification sent for: " + fullName);
                    resolve(info);
                }
            });
        });

        generalLogger.info(`Appointment cancellation emails sent for ${fullName} - ${course}`);
    } catch (error) {
        generalLogger.error("Error sending appointment cancellation emails: " + error);
        throw error;
    }
}

async function sendAppointmentRequestToAdmin(fullName, email, course, preferredDays, preferredTime, notes) {
    let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "noosa@noosaengage.com",
                    pass: process.env.EMAIL_PASSWORD
                }
            })

   const preferredDaysFormatted = preferredDays.map(day => 
       day.charAt(0).toUpperCase() + day.slice(1)
   ).join(', ');

   const timeSlotFormatted = preferredTime.charAt(0).toUpperCase() + preferredTime.slice(1);

   let emailDetails = {
       from: '"Noosa Engage" <noosa@noosaengage.com>',
       to: "noosa@noosaengage.com",
       subject: `New Session Request from ${fullName}`,
       html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #0A3755;">New Session Request</h2>
               
               <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                   <h3 style="color: #0A3755; margin-top: 0;">Student Information</h3>
                   <p><strong>Name:</strong> ${fullName}</p>
                   <p><strong>Email:</strong> ${email}</p>
               </div>

               <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                   <h3 style="color: #0A3755; margin-top: 0;">Session Details</h3>
                   <p><strong>Subject:</strong> ${course}</p>
                   <p><strong>Preferred Days:</strong> ${preferredDaysFormatted}</p>
                   <p><strong>Preferred Time:</strong> ${timeSlotFormatted}</p>
               </div>

               ${notes ? `
               <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                   <h3 style="color: #0A3755; margin-top: 0;">Additional Notes</h3>
                   <p style="white-space: pre-wrap;">${notes}</p>
               </div>
               ` : ''}

               <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #0A3755; margin: 20px 0;">
                   <p style="margin: 0; color: #0A3755;"><strong>Action Required:</strong> Please review this request and contact the student within 24 hours to confirm session details.</p>
               </div>

               <hr style="border: 1px solid #eee; margin: 30px 0;">
               <p style="color: #666; font-size: 14px;">
                   This email was sent automatically from the Noosa Engage scheduling system.
               </p>
           </div>
       `
   };

   await new Promise((resolve, reject) => {
       mailTransporter.sendMail(emailDetails, (error, info) => {
           if (error) {
               generalLogger.error("Failed to send appointment request email: " + error);
               reject(error);
           } else {
               generalLogger.info("Appointment request email sent successfully to admin");
               resolve(info);
           }
       });
   });
}

async function processAppointmentRequest(req, res) {
    try {
        const { course, date, time, user } = await validateAppointmentRequest(req)
        
        const newAppointment = new Appointment({
            customer: user._id,
            courseName: course,
            appointmentDate: date,
            appointmentTime: time
        })

        await newAppointment.save()

        sendAppointmentConfirmationEmail(user.fullName, course, date, time, user.email, res)
        return res.status(200).send({ message: "Appointment was scheduled successfully" })

    } catch (err) {
        generalLogger.error("Error creating appointment:", err.message)
        return res.status(400).send({ message: err.message })
    }
}

async function cancelAppointment(req, res) {
    const appointmentId = req.body.appointmentId
    try {
        const appointmentToCancel = await Appointment.findById(appointmentId)
        appointmentToCancel.status = "Cancelled"
        await appointmentToCancel.save()

        const user = await User.findById(appointmentToCancel.customer)

        sendAppointmentCancellationEmail(user.fullName, appointmentToCancel.courseName, appointmentToCancel.appointmentDate, appointmentToCancel.appointmentTime, user.email, res)

        generalLogger.debug("Appointment with id ", appointmentId, " was cancelled successfully")
        return res.status(200).send({ message: "Appointment was cancelled successfully" })

    } catch (err) {
        generalLogger.error("Error cancelling appointment with id ", appointmentId, ": ", err.message)
        return res.status(400).send({ message: err.message })
    }
}

async function validateAppointmentRequest(req) {
    const { course, date, time } = req.body

    if (!course || !date || !time) {
        throw new Error("Error: All fields must be completed")
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
        throw new Error("User not found")
    }

    return { course, date, time, user }
}

module.exports = { processInitialAppointmentRequest, validateInitialAppointmentRequest, processAppointmentRequest, cancelAppointment }
