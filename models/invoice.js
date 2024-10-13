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
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: 0 // Set default to 0, will calculate before saving
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false  // Default value is false, meaning unpaid
    }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

// Pre-save hook to calculate the total before saving
invoiceSchema.pre('save', function(next) {
    this.total = this.hours * this.price; // Calculate total based on hours and price
    next();
});

// Create the model
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
