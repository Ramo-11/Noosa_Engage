const { MongoClient } = require('mongodb');

// Function to fetch available slots
async function getAvailableSlots(req, res) {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const database = client.db('Appointments');
        const collection = database.collection('AvailableSlots');
        const slots = await collection.find({}).toArray();
        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch available slots' });
    } finally {
        await client.close();
    }
}

// Function to fetch available times based on the selected date
async function getAvailableTimes(req, res) {
    const selectedDate = req.params.date;
    console.log(`Selected date: ${selectedDate}`); // Log the selected date
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('Appointments');
        const collection = database.collection('AvailableSlots');
        const slots = await collection.find({ Date: selectedDate }).toArray();
        console.log(`Fetched slots: ${JSON.stringify(slots)}`); // Log fetched slots

        const times = slots.flatMap(slot => slot.Time);
        const uniqueTimes = [...new Set(times)];

        res.json(uniqueTimes);
    } catch (error) {
        console.error('Error in getAvailableTimes:', error);
        res.status(500).json({ message: 'Failed to fetch available times' });
    } finally {
        await client.close();
    }
}


module.exports = { getAvailableSlots, getAvailableTimes };
