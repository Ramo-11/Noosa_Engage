const fs = require('fs')
const path = require('path')

const getCourseData = (courseName) => {
    const filePath = path.join(__dirname, '../utils/courseData.json')
    
    const data = fs.readFileSync(filePath, 'utf-8')
    const courseData = JSON.parse(data)
    return courseData[courseName] || null
}

const renderCoursePage = async (req, res) => {
    const course = getCourseData(req.params.courseName)

    if (course) {
        res.render('course', course)
    } else {
        res.status(404).send('Course not found')
    }
}

module.exports = renderCoursePage