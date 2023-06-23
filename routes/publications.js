const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()

router.get('/id_for/:slug', function (req, res) {

        const url = `${constants.mediumBaseUrl}/${req.params.slug}?format=json`

        request(url, function (err, response, body) {
            if (err) {
                console.error(err)
                return res.status(500).send({success: false, error: err})
            }

            const parsedBody = utils.formatMediumResponse(response)

            if (!parsedBody.success) {
                return res.status(404).send({success: false, error: parsedBody.error})
            }

            const publicationId = parsedBody.payload.collection.id
            res.send({success: true, data: {publicationId}})
        })
    })


router.get('/:publicationId', function (req, res) {
    const url = `${constants.mediumApiUrl}/collections/${req.params.publicationId}/stream`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({success: false, error: err})
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({success: false, error: parsedBody.error})
        }

        const name = parsedBody.payload.collection.name
        const description = parsedBody.payload.collection.description
        const slug = parsedBody.payload.collection.slug
        const creator = parsedBody.payload.collection.creatorId
        const contributors = Object.keys(parsedBody.payload.references.User)
        const tags = parsedBody.payload.collection.tags
        const followersCount = parsedBody.payload.collection.metadata.followerCount
        const image = utils.getMediumMediaUrl(parsedBody.payload.collection.imageId)
        const logo = utils.getMediumMediaUrl(parsedBody.payload.collection.logo.imageId)
        const twitter = parsedBody.payload.collection.twitterUsername
        const facebook = parsedBody.payload.collection.facebookPageName
        const email = parsedBody.payload.collection.publicEmail

        res.send({
            success: true,
            data: {
                name,
                description,
                slug,
                creator,
                contributors,
                tags,
                followersCount,
                image,
                logo,
                twitter,
                facebook,
                email
            }
        })
    })
})


router.get('/:publicationId/articles', async function (req, res) {
    const count = req.query.count
    const url = `${constants.mediumApiUrl}/collections/${req.params.publicationId}/stream`

    let posts = []

    const getPosts = async (url) => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    return res.reject(err)
                }


                const parsedBody = utils.formatMediumResponse(response)

                if (!parsedBody.success) {
                    return reject(parsedBody.error)
                }

                if (parsedBody.success && !parsedBody.payload.paging.next) {
                    return resolve()
                }

                const postsData = parsedBody.payload.references.Post
                const postIds = Object.keys(postsData)
                posts = posts.concat(postIds)

                if (count && posts.length >= count) {
                    posts = posts.slice(0, count)
                    return resolve()
                }

                if (parsedBody.payload.paging.next) {
                    return resolve(getPosts(`${url}?to=${parsedBody.payload.paging.next.to}&page=${parsedBody.payload.paging.next.page}`))
                }

                return resolve()
            })
        })
    }

        try {
            await getPosts(url)
            res.send({success: true, data: posts})
        } catch (err) {
            res.status(500).send({success: false, error: err})
        }
})


router.get('/:publicationId/newsletter', function (req, res) {
    const url = `${constants.mediumApiUrl}/collections/${req.params.publicationId}/stream`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({success: false, error: err})
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({success: false, error: parsedBody.error})
        }


        const newsletterData = parsedBody.payload.collection.newsletterV3

        if (!newsletterData) {
            return res.status(404).send({success: false, error: "Newsletter not found"})
        }

        const name = newsletterData.name
        const description = newsletterData.description
        const slug = newsletterData.newsletterSlug
        const subscribersCount = newsletterData.subscribersCount

        res.send({success: true, data: {name, description, slug, subscribersCount}})
    })
})


module.exports = router