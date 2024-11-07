const Invoice = require("../models/Invoice")
const { generalLogger } = require('./utils/generalLogger')

async function payInvoice(req, res) {
    const invoiceNumber = req.body.invoiceNumber
    try {
        const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber })
        invoice.isPaid = true
        await invoice.save()

        generalLogger.debug("Invoice with number ", invoiceNumber, " was marked as paid")
        return res.status(200).send({ message: "Invoice was mark as paid" })

        // TODO: Implement payment processing logic here

    } catch (err) {
        generalLogger.error("Error paying invoice with number ", invoiceNumber, ": ", err.message)
        return res.status(400).send({ message: err.message })
    }
}

module.exports = { payInvoice }