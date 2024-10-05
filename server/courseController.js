const getCourseData = (courseName) => {
    const courseData = {
        'pre-algebra': { className: 'Pre-Algebra', classDescription: 'This is a pre-algebra class...' },
        'algebra': { className: 'Algebra', classDescription: 'This is an algebra class...' },
        // Add other courses here
    };

    return courseData[courseName];
};
const renderCoursePage = (req, res) => {
    const course = getCourseData(req.params.courseName);

    if (course) {
        console.log(course)
        res.render('course', course);
    } else {
        res.status(404).send('Course not found');
    }
};

module.exports = renderCoursePage;