const multer = require("multer")
const path = require("path")
const { generalLogger } = require("../utils/generalLogger")

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".JPG" && ext !== ".JPEG" && ext !== ".PNG") {
            generalLogger.error("Unable to create project. File type is not supported")
            cb(new Error("Picture type is not supported"), false)
            return
        }
        cb(null, true)
    }
})
