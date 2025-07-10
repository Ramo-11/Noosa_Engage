const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { generalLogger } = require('./utils/generalLogger')
const { sendAppointmentCancellationEmail } = require('./mail')
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

async function sendAppointmentConfirmationEmail(fullName, course, date, time, email) {
   let mailTransporter = nodemailer.createTransport({
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

   let emailDetails = {
       from: '"Noosa Engage" <noosa@noosaengage.com>',
       to: email,
       subject: `Session Confirmed - ${course}`,
       html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #0A3755;">Session Confirmation</h2>
               <p>Hello ${fullName},</p>
               <p>Great news! Your tutoring session has been confirmed.</p>
               
               <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
                   <h3 style="color: #166534; margin-top: 0;">Session Details</h3>
                   <p style="margin: 5px 0;"><strong>Subject:</strong> ${course}</p>
                   <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
                   <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
               </div>

               <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe; margin: 20px 0;">
                   <h4 style="color: #1d4ed8; margin-top: 0;">What's Next?</h4>
                   <ul style="color: #1e40af;">
                       <li>You'll receive a meeting link 15 minutes before your session</li>
                       <li>Prepare any questions or materials you'd like to cover</li>
                       <li>Ensure you have a stable internet connection</li>
                   </ul>
               </div>

               <div style="background: #fefce8; padding: 15px; border-radius: 8px; border: 1px solid #fde047; margin: 20px 0;">
                   <p style="margin: 0; color: #a16207;"><strong>Need to reschedule?</strong> Please contact us at least 24 hours in advance.</p>
               </div>

               <hr style="border: 1px solid #eee; margin: 30px 0;">
               <p style="color: #666; font-size: 14px;">
                   Best regards,<br>
                   The Noosa Engage Team
               </p>
           </div>
       `
   };

   await new Promise((resolve, reject) => {
       mailTransporter.sendMail(emailDetails, (error, info) => {
           if (error) {
               generalLogger.error("Failed to send appointment confirmation email: " + error);
               reject(error);
           } else {
               generalLogger.info("Appointment confirmation email sent to: " + email);
               resolve(info);
           }
       });
   });
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
