const fs = require('fs');
const path = require('path');

// Path to the availableTimes.json file
const availableTimesPath = path.join(__dirname, 'availableTimes.json');

// Function to get the start and end dates for a given month
const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
};

// Function to generate times for a single day
const generateTimesForDay = (date) => {
    const times = [];
    let currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 16, 0); // 4:00 PM

    while (currentTime.getHours() < 22) { // 10:00 PM
        times.push(currentTime.toTimeString().substring(0, 5)); // Format HH:MM
        currentTime.setHours(currentTime.getHours() + 1); // Increment by 1 hour
    }

    return times;
};

// Function to generate available times for the entire year
const generateYearlyTimes = () => {
    const now = new Date();
    const availableTimes = {};

    for (let month = 0; month < 12; month++) {
        const { start, end } = getMonthRange(new Date(now.getFullYear(), month, 1));
        
        for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
            const dateStr = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
            availableTimes[dateStr] = generateTimesForDay(day);
        }
    }

    return availableTimes;
};

// Function to update availableTimes.json
const updateAvailableTimesFile = () => {
    const availableTimes = generateYearlyTimes();

    fs.writeFile(availableTimesPath, JSON.stringify(availableTimes, null, 2), (err) => {
        if (err) {
            console.error('Error writing to availableTimes.json:', err);
        } else {
            console.log('availableTimes.json has been updated for the year.');
        }
    });
};

// Run the update
updateAvailableTimesFile();
