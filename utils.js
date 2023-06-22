const constants = require('./const')


const formatMediumResponse = (response) => {
    const body = response.body
    const strippedBody = body.substring(constants.mediumResPrefix.length)
    const parsedBody = JSON.parse(strippedBody)
    return parsedBody
}

const getMediumMediaUrl = (mediaId) => {
    return `${constants.mediumMediaUrl}/${mediaId}`
}


module.exports = {
    formatMediumResponse,
    getMediumMediaUrl
}