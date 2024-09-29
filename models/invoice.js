const mongoose = require("mongoose");

// Define the Invoice schema
const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,  // Ensure invoice number is unique
        trim: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    sessionDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: function() {
            return this.hours * this.quantity * 50;  // Auto-calculate total
        }
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

// Create the model
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
