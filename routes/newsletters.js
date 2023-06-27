const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get("/:newsletterId", function (req, res) {
    const url = `${constants.mediumApiUrl}/newsletters/${req.params.newsletterId}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const newsletter = parsedBody.payload.newsletter
        const author = newsletter.creatorId
        const description = newsletter.description
        const slug = newsletter.newsletterSlug
        const title = newsletter.promoHeadline
        const newsletterBody = newsletter.promoBody
        const replyTo = newsletter.replyToEmail

        res.send({ success: true, data: { newsletterId: req.params.newsletterId, author, description, slug, title, newsletterBody, replyTo } })
    })
})



module.exports = router