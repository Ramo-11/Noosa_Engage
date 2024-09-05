const fs = require('fs');
const path = require('path');

// Path to the availableTimes.json file
const availableTimesPath = path.join(__dirname, 'availableTimes.json');

// Define times for each day of the week for both Mostafa and Omar
const weeklyTimesMostafa = {
    1: ["17:00", "18:00"], // Monday
    2: ["17:00", "18:00"], // Tuesday
    3: ["19:00", "21:00"], // Wednesday
    4: ["16:00", "17:00"], // Thursday
    5: ["17:00", "19:00"], // Friday
    6: ["15:00", "17:00"], // Saturday
    0: ["14:00", "16:00"]  // Sunday
};

const weeklyTimesOmar = {
    1: ["15:00", "16:00"], // Monday
    2: ["15:00", "17:00"], // Tuesday
    3: ["19:00", "22:00", "23:00"], // Wednesday
    4: ["16:00", "18:00"], // Thursday
    5: ["14:00", "16:00"], // Friday
    6: ["12:00", "14:00"], // Saturday
    0: ["10:00", "12:00"]  // Sunday
};

// Function to get the start and end dates for the current year (ending Dec 31, 2024)
const getYearRange = () => {
    const start = new Date();
    const end = new Date(2024, 11, 31); // December 31, 2024
    return { start, end };
};

// Function to generate available times for the entire year for both Mostafa and Omar
const generateYearlyTimes = () => {
    const { start, end } = getYearRange();
    const availableTimes = {
        Mostafa: {},
        Omar: {}
    };

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = day.getDay();
        const dateStr = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Assign times for Mostafa
        availableTimes.Mostafa[dateStr] = weeklyTimesMostafa[dayOfWeek] || [];
        
        // Assign times for Omar
        availableTimes.Omar[dateStr] = weeklyTimesOmar[dayOfWeek] || [];
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
