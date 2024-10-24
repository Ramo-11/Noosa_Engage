//#region Imports
const User = require("../models/User"); // Ensure the path to your User model is correct
const Invoice = require('../models/invoice'); // Import the Invoice model
//#endregion

//#region Methods
const getInvoicesForUser = async (req, res) => {
    // Check if userId exists in the session
    if (!req.session || !req.session.userId) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found"); // Handle user not found
        }

        // Fetch invoices associated with the user's ID
        const invoices = await Invoice.find({ customer: user._id }).exec();

        // Render the invoices page with user and invoices data
        res.render("dashboard/invoices", { user, invoices }); // Adjust the path to your invoices.ejs file
    } catch (err) {
        console.error("Error retrieving invoices:", err);
        return res.status(500).send("Error retrieving invoices");
    }
};
 
const createInvoiceForUser = async (req, res) => {
    // Check if userId exists in the session
    if (!req.session || !req.session.userId) {
        return res.status(403).send("User not authenticated"); // User must be authenticated
    }

    try {
        // Extract invoice data from the request body
        const { invoiceNumber, sessionDate, dueDate, hours, price, firstName, lastName, email } = req.body;

        // Validate required fields
        if (!invoiceNumber || !sessionDate || !dueDate || hours == null || price == null || !firstName || !lastName || !email) {
            return res.status(400).send("All fields are required"); // Return error if fields are missing
        }

        // Check if the user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("Customer not found"); // Return error if the customer does not exist
        }

        // Create a new invoice
        const newInvoice = new Invoice({
            invoiceNumber,
            customer: user._id, // Link to the customer
            sessionDate,
            dueDate,
            hours,
            price,
            total: hours * price // Calculate total based on hours and price
        });

        // Save the invoice to the database
        await newInvoice.save();

        // Respond with a success message
        res.status(201).send("Invoice created successfully");
    } catch (err) {
        console.error("Error creating invoice:", err);
        return res.status(500).send("Error creating invoice"); // Return error if something goes wrong
    }
};



//#endregion

//#region Exports
module.exports = {
    getInvoicesForUser,
    createInvoiceForUser,
};
//#endregion