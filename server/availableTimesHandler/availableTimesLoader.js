const fs = require('fs');
const path = require('path');
const { generalLogger } = require('../../utils/generalLogger');

const availableTimesPath = path.join(__dirname, '../availableTimesHandler/availableTimes.json');

const getAvailableTimes = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(availableTimesPath, 'utf8', (err, data) => {
            if (err) {
                generalLogger.error("Error reading availableTimes.json:", err);
                return reject(err);
            }
            try {
                resolve(JSON.parse(data));
            } catch (parseError) {
                generalLogger.error("Error parsing JSON data:", parseError);
                reject(parseError);
            }
        });
    });
};

const getAvailableDatesForTutor = async (tutor) => {
    try {
        const availableTimes = await getAvailableTimes();
        
        if (availableTimes && availableTimes[tutor]) {
            return Object.keys(availableTimes[tutor]);
        } else {
            throw new Error(`No dates available for tutor ${tutor}`);
        }
    } catch (error) {
        generalLogger.error("Error getting available dates for tutor:", error);
        throw error;
    }
};

const getAvailableTimesForTutorAndDate = async (tutor, date) => {
    try {
        const availableTimes = await getAvailableTimes();
        
        if (availableTimes && availableTimes[tutor]) {
            const tutorTimes = availableTimes[tutor];
            
            return tutorTimes[date] || [];
        } else {
            throw new Error(`No times available for tutor ${tutor}`);
        }
    } catch (error) {
        generalLogger.error("Error getting available times for tutor and date:", error);
        throw error;
    }
};
const getAvailableTimesRouteHandler = async (req, res) => {
    const { tutor, date } = req.query;
    try {
        const times = await getAvailableTimesForTutorAndDate(tutor, date);
        res.json(times);
    } catch (error) {
        generalLogger.error("Error getting available times for tutor and date:", error);
        res.status(500).send("Internal Server Error");
    }
};

const getAvailableDatesRouteHandler = async (req, res) => {
    const { tutor } = req.query;
    try {
        const dates = await getAvailableDatesForTutor(tutor);
        res.json(dates);
    } catch (error) {
        generalLogger.error("Error getting available dates for tutor:", error);
        res.status(500).send("Internal Server Error");
    }
};

const renderSchedulePageHandler = async (req, res) => {
    try {
        const availableTimes = await getAvailableTimes();
        res.render("schedule", { availableTimes });
    } catch (error) {
        generalLogger.error("Error reading availableTimes.json:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getAvailableTimesRouteHandler,
    renderSchedulePageHandler,
    getAvailableDatesRouteHandler
}
