const fs = require('fs');
const path = require('path');

const getCourseData = (courseName, callback) => {
    const filePath = path.join(__dirname, '../utils/courseData.json');
    
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return callback(err, null);
        }
        const courseData = JSON.parse(data);
        const course = courseData[courseName];
        
        if (course) {
            callback(null, course);
        } else {
            callback('Course not found', null);
        }
    });
};

module.exports = getCourseData;