const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get('/id_for/:username', function (req, res) {



    const url = `${constants.mediumApiUrl}/users/@${req.params.username}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: "User not found" })
        }

        const userId = parsedBody.payload.value.userId
        res.send({ success: true, data: { userId } })


    })


})

router.get('/:userId', function (req, res) {
    const url = `${constants.mediumApiUrl}/users/${req.params.userId}/meta`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send()
        }

        const username = parsedBody.payload.references.User[req.params.userId].username
        const fullName = parsedBody.payload.references.User[req.params.userId].name
        const bio = parsedBody.payload.references.User[req.params.userId].bio
        const avatar = utils.getMediumMediaUrl(parsedBody.payload.references.User[req.params.userId].imageId)
        const banner = utils.getMediumMediaUrl(parsedBody.payload.references.User[req.params.userId].backgroundImageId)
        const followersCount = parsedBody.payload.references.SocialStats[req.params.userId].usersFollowedByCount
        const followingCount = parsedBody.payload.references.SocialStats[req.params.userId].usersFollowedCount
        const twitter = parsedBody.payload.references.User[req.params.userId].twitterScreenName
        const isCreatorPartnerProgramEnrolled = parsedBody.payload.references.User[req.params.userId].isCreatorPartnerProgramEnrolled
        const topWriterIn = parsedBody.payload.references.User[req.params.userId].topWriterInTags
        const joinedDate = new Date(parsedBody.payload.references.User[req.params.userId].createdAt).toISOString()

        res.send({
            success: true,
            data: {
                userId: req.params.userId,
                username,
                fullName,
                bio,
                avatar,
                banner,
                followersCount,
                followingCount,
                twitter,
                isCreatorPartnerProgramEnrolled,
                topWriterIn: topWriterIn ? topWriterIn.map(tag => tag.name) : [],
                joinedDate
            }
        })

    })
})


module.exports = router