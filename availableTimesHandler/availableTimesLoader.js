const fs = require('fs');
const path = require('path');

// Path to the availableTimes.json file
const availableTimesPath = path.join(__dirname, '../availableTimesHandler/availableTimes.json');

// Function to read availableTimes.json
const getAvailableTimes = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(availableTimesPath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading availableTimes.json:", err);
                return reject(err);
            }
            try {
                resolve(JSON.parse(data));
            } catch (parseError) {
                console.error("Error parsing JSON data:", parseError);
                reject(parseError);
            }
        });
    });
};

// Function to get available times for a specific tutor and date
const getAvailableTimesForTutorAndDate = async (tutor, date) => {
    try {
        const availableTimes = await getAvailableTimes();
        
        // Check if tutor exists in the availableTimes data
        if (availableTimes && availableTimes[tutor]) {
            const tutorTimes = availableTimes[tutor];
            
            // Return times for the specific date or an empty array if not found
            return tutorTimes[date] || [];
        } else {
            throw new Error(`No times available for tutor ${tutor}`);
        }
    } catch (error) {
        console.error("Error getting available times for tutor and date:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

module.exports = {
    getAvailableTimes,
    getAvailableTimesForTutorAndDate
};
