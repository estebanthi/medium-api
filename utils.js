const constants = require('./const')


const formatMediumResponse = (response) => {
    const body = response.body
    const strippedBody = body.substring(constants.mediumResPrefix.length)
    const parsedBody = JSON.parse(strippedBody)
    return parsedBody
}


module.exports = {
    formatMediumResponse,
}