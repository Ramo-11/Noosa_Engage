const fs = require('fs');
const path = require('path');

// Path to the availableTimes.json file
const availableTimesPath = path.join(__dirname, 'availableTimes.json');

// Define times for each day of the week for Mostafa Abdulaleem and Omar Abdelalim (in 24-hour format)
const weeklyTimesMostafaAbdulaleem = {
    1: ["17:00"], // Monday
    3: ["19:00", "21:00"], // Wednesday
    4: ["16:00", "17:00"], // Thursday
    5: ["17:00", "19:00"], // Friday
    // No availability on Saturday and Sunday
};

const weeklyTimesOmarAbdelalim = {
    1: ["15:00", "16:00"], // Monday
    2: ["15:00", "17:00"], // Tuesday
    3: ["19:00", "22:00", "23:00"], // Wednesday
    4: ["16:00", "18:00"], // Thursday
    5: ["14:00", "16:00"], // Friday
    // No availability on Saturday and Sunday
};

// Function to convert 24-hour time to 12-hour AM/PM format
const convertTo12HourFormat = (time24) => {
    let [hours, minutes] = time24.split(':').map(Number);
    let period = 'AM';

    if (hours >= 12) {
        period = 'PM';
        hours = hours > 12 ? hours - 12 : hours; // Convert to 12-hour format
    } else if (hours === 0) {
        hours = 12; // Midnight case
    }

    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Function to get the start and end dates for the current year (ending Dec 31, 2024)
const getYearRange = () => {
    const start = new Date();
    const end = new Date(2024, 11, 31); // December 31, 2024
    return { start, end };
};

// Function to generate available times for the entire year for Mostafa Abdulaleem and Omar Abdelalim
const generateYearlyTimes = () => {
    const { start, end } = getYearRange();
    const availableTimes = {
        "Mostafa Abdulaleem": {},
        "Omar Abdelalim": {}
    };

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = day.getDay();
        const dateStr = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Only add available times for days that have availability
        if (weeklyTimesMostafaAbdulaleem[dayOfWeek]) {
            availableTimes["Mostafa Abdulaleem"][dateStr] = (weeklyTimesMostafaAbdulaleem[dayOfWeek] || []).map(time => convertTo12HourFormat(time));
        }
        if (weeklyTimesOmarAbdelalim[dayOfWeek]) {
            availableTimes["Omar Abdelalim"][dateStr] = (weeklyTimesOmarAbdelalim[dayOfWeek] || []).map(time => convertTo12HourFormat(time));
        }
    }

    return availableTimes;
};

// Function to update availableTimes.json (overwrite if exists, create if not)
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
