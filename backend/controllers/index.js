module.exports.home = function (req, res, next) {
    let messageObj = {
        message: "Property Managment System Backend Running"
    }
    res.json(messageObj);
}