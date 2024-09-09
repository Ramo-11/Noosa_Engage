const fs = require('fs');
const path = require('path');

const availableTimesPath = path.join(__dirname, 'availableTimes.json');

const weeklyTimesMostafaAbdulaleem = {
    1: ["17:00"],
    3: ["19:00", "21:00"],
    4: ["16:00", "17:00"],
    5: ["17:00", "19:00"],
};

const weeklyTimesOmarAbdelalim = {
    1: ["15:00", "16:00"],
    2: ["15:00", "17:00"],
    3: ["19:00", "22:00", "23:00"],
    4: ["16:00", "18:00"],
    5: ["14:00", "16:00"],
};

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

const getYearRange = () => {
    const start = new Date();
    const end = new Date(2024, 11, 31);
    return { start, end };
};

const generateYearlyTimes = () => {
    const { start, end } = getYearRange();
    const availableTimes = {
        "Mostafa Abdulaleem": {},
        "Omar Abdelalim": {}
    };

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dayOfWeek = day.getDay();
        const dateStr = day.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        if (weeklyTimesMostafaAbdulaleem[dayOfWeek]) {
            availableTimes["Mostafa Abdulaleem"][dateStr] = (weeklyTimesMostafaAbdulaleem[dayOfWeek] || []).map(time => convertTo12HourFormat(time));
        }
        if (weeklyTimesOmarAbdelalim[dayOfWeek]) {
            availableTimes["Omar Abdelalim"][dateStr] = (weeklyTimesOmarAbdelalim[dayOfWeek] || []).map(time => convertTo12HourFormat(time));
        }
    }

    return availableTimes;
};

const updateAvailableTimesFile = () => {
    const availableTimes = generateYearlyTimes();

    fs.writeFile(availableTimesPath, JSON.stringify(availableTimes, null, 2), (err) => {
        if (err) {
            logg.error('Error writing to availableTimes.json:', err);
        } else {
            console.log('availableTimes.json has been updated for the year.');
        }
    });
};

updateAvailableTimesFile();
