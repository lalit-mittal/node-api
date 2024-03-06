const path = require('path')
const fs = require('fs')


exports.clearImage = (filePath) => {
    try {
        filePath = path.join(__dirname, '..', filePath)
        fs.unlink(filePath, (err) => {
            console.log(err);

        })
    } catch (error) {
        console.log(error)
    }
}