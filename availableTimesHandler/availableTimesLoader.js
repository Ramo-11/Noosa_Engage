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

// Function to get available dates for a specific tutor
const getAvailableDatesForTutor = async (tutor) => {
    try {
        const availableTimes = await getAvailableTimes();
        
        // Check if tutor exists in the availableTimes data
        if (availableTimes && availableTimes[tutor]) {
            // Get all the dates (keys) for the specified tutor
            return Object.keys(availableTimes[tutor]);
        } else {
            throw new Error(`No dates available for tutor ${tutor}`);
        }
    } catch (error) {
        console.error("Error getting available dates for tutor:", error);
        throw error;
    }
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
const getAvailableTimesRouteHandler = async (req, res) => {
    const { tutor, date } = req.query;
    try {
        const times = await getAvailableTimesForTutorAndDate(tutor, date);
        res.json(times);
    } catch (error) {
        console.error("Error getting available times for tutor and date:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Route handler to get available dates for a specific tutor
const getAvailableDatesRouteHandler = async (req, res) => {
    const { tutor } = req.query;
    try {
        const dates = await getAvailableDatesForTutor(tutor);
        res.json(dates);
    } catch (error) {
        console.error("Error getting available dates for tutor:", error);
        res.status(500).send("Internal Server Error");
    }
};

const renderSchedulePageHandler = async (req, res) => {
    try {
        const availableTimes = await getAvailableTimes(); // Fetch all available times
        res.render("schedule", { availableTimes });
    } catch (error) {
        console.error("Error reading availableTimes.json:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getAvailableTimesRouteHandler,
    renderSchedulePageHandler,
    getAvailableDatesRouteHandler
};
