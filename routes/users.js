const express = require('express')
const request = require('request')
const utils = require("../utils");

const router = express.Router()


router.get('/:username', function (req, res) {
    const url = `https://medium.com/_/api/users/@${req.params.username}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send()
        }

        const userId = parsedBody.payload.value.userId
        res.send({ userId })


    })


})




module.exports = router