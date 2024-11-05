const Invoice = require("../models/Invoice")
const { generalLogger } = require('./utils/generalLogger')

async function payInvoice(req, res) {
    const invoiceNumber = req.body.invoiceNumber
    try {
        const invoiceToCancel = await Invoice.findOne({ invoiceNumber: invoiceNumber })

        // TODO: Implement payment processing logic here

        generalLogger.debug("Invoice with number ", invoiceNumber, " was paid successfully")
        return res.status(400).send({ message: "Not implemented yet" })

    } catch (err) {
        generalLogger.error("Error paying invoice with number ", invoiceNumber, ": ", err.message)
        return res.status(400).send({ message: err.message })
    }
}

module.exports = { payInvoice }