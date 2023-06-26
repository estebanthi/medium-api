const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get('/:articleId', function (req, res) {
    const url = `${constants.mediumApiUrl}/posts/${req.params.articleId}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const title = parsedBody.payload.value.title
        const subtitle = parsedBody.payload.value.content.subtitle
        const authorId = parsedBody.payload.value.creatorId
        const publishedAt = new Date(parsedBody.payload.value.firstPublishedAt).toISOString()
        const updatedAtValue = parsedBody.payload.value.lastUpdatedAt
        const updatedAt = updatedAtValue ? new Date(updatedAtValue).toISOString() : null
        const url = parsedBody.payload.value.mediumUrl
        const publicationId = parsedBody.payload.value.homeCollectionId
        const tags = parsedBody.payload.value.virtuals.tags.map(tag => tag.name)
        const topics = parsedBody.payload.value.virtuals.topics.map(topic => topic.name)
        const wordCount = parsedBody.payload.value.virtuals.wordCount
        const readingTime = parsedBody.payload.value.virtuals.readingTime
        const clapCount = parsedBody.payload.value.virtuals.totalClapCount
        const voters = parsedBody.payload.value.virtuals.recommends
        const responsesCount = parsedBody.payload.value.virtuals.responsesCreatedCount
        const lang = parsedBody.payload.value.detectedLanguage
        const requiresSubscription = parsedBody.payload.value.isSubscriptionLocked
        const isSeries = parsedBody.payload.value.isSeries
        const previewImage = utils.getMediumMediaUrl(parsedBody.payload.value.virtuals.previewImage.imageId)


        const post = {
            articleId: req.params.articleId,
            title,
            subtitle,
            authorId,
            publishedAt,
            updatedAt,
            url,
            publicationId,
            tags,
            topics,
            wordCount,
            readingTime,
            clapCount,
            voters,
            responsesCount,
            lang,
            requiresSubscription,
            isSeries,
            previewImage
        }

        res.send({ success: true, data: post })
})
})


router.get('/:articleId/content', function (req, res) {
    const url = `${constants.mediumApiUrl}/posts/${req.params.article}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const contentArray = parsedBody.payload.value.content.bodyModel.paragraphs.map(paragraph => {
            if (paragraph.text) {
                return paragraph.text
            }
        })

        const content = contentArray.join("\n\n")

        res.send({ success: true, data: content })
    })
})


router.get('/:articleId/markdown', function (req, res) {
    const url = `${constants.mediumApiUrl}/posts/${req.params.articleId}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const contentArray = parsedBody.payload.value.content.bodyModel.paragraphs.map(utils.getPostBodyParagraphMarkdown)
        const content = contentArray.join("\n\n")

        console.log(content)

        res.send({ success: true, data: content })
    })
})


router.get('/:articleId/html', function (req, res) {
const url = `${constants.mediumApiUrl}/posts/${req.params.articleId}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send()
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const contentArray = parsedBody.payload.value.content.bodyModel.paragraphs.map(utils.getPostBodyParagraphHTML)

        const content = contentArray.join("</br></br>")

        res.send({ success: true, data: content })
    })
})


module.exports = router