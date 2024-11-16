require('dotenv').config()
if (process.env.NODE_ENV != "production") {
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_TEST
} else {
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_PROD
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Invoice = require("../models/Invoice")
const User = require("../models/User")
const { generalLogger } = require('./utils/generalLogger')

async function payInvoice(req, res) {
    const { invoiceNumber }  = req.body
    const userId = req.session.userId

    if (!invoiceNumber) {
        return res.status(400).send({ message: "Invoice number is required" })
    }
    
    if (!userId) {
        return res.status(400).send({ message: "User not found" })
    }
    try {
        const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber })
        if (invoice.isPaid) {
            return res.status(400).send({ message: "Invoice has already been paid" })
        }
        const user = await User.findById(req.session.userId)
        const userEmail = user.email
        const amount = invoice.total * 100

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: { invoiceNumber, userId },
            automatic_payment_methods: {
                enabled: true,
            },
            description: 'Charge for ' + userEmail,
        })

        generalLogger.debug("Payment intent created for invoice " + invoiceNumber)
        return res.status(200).send({ clientSecret: paymentIntent.client_secret })
    } catch (err) {
        generalLogger.error("Error creating payment intent for invoice " + invoiceNumber + ": " + err.message)
        return res.status(500).send({ message: err.message })
    }
}

async function confirmInvoicePayment(req, res) {
    const { invoiceNumber } = req.body;

    if (!invoiceNumber) {
        return res.status(400).send({ message: "Invoice number is required" })
    }

    try {
        const invoice = await Invoice.findOne({ invoiceNumber })
        if (invoice.isPaid) {
            return res.status(400).send({ message: "Invoice has already been marked as paid" })
        }

        invoice.isPaid = true
        await invoice.save()

        generalLogger.info("Invoice " + invoiceNumber + " has been marked as paid")
        return res.status(200).send({ message: "Invoice has been paid" })
    } catch (err) {
        generalLogger.error("Error confirming payment for invoice " + invoiceNumber + ": " + err.message)
        return res.status(500).send({ message: err.message })
    }
}

module.exports = { payInvoice, confirmInvoicePayment }