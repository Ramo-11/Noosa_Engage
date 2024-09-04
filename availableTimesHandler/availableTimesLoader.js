const fs = require('fs');
const path = require('path');

// Path to the availableTimes.json file
const availableTimesPath = path.join(__dirname, '../availableTimesHandler/availableTimes.json');

// Function to read availableTimes.json
const getAvailableTimes = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(availableTimesPath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
};

// Function to get available times for a specific date
const getAvailableTimesForDate = async (date) => {
    try {
        const availableTimes = await getAvailableTimes();
        return availableTimes[date] || []; // Return times for the specific date or an empty array if not found
    } catch (error) {
        console.error("Error getting available times for date:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

module.exports = {
    getAvailableTimes,
    getAvailableTimesForDate
};
