const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get("/:publicationSlug", async function (req, res) {
    const count = req.query.count || 30
    const searchQuery = req.query.q

    if (!searchQuery) {
        return res.status(400).send({success: false, error: "Missing query parameter 'q'"})
    }

    const url = `${constants.mediumApiUrl}/collections/${req.params.publicationSlug}/search?q=${searchQuery}`
    console.log(url)

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

                const postsData = parsedBody.payload.posts
                const postIds = postsData.map(post => post.id)

                posts = posts.concat(postIds)

                if (count && posts.length >= count) {
                    posts = posts.slice(0, count)
                    return resolve()
                }

                if (parsedBody.payload.paging.next) {
                    return resolve(getPosts(`${url}&page=${parsedBody.payload.paging.next.page}`))
                }

                return resolve()

            })

        })
    }

    try {
        await getPosts(url)
        res.send({success: true, data: posts.slice(0, count)})
    }
    catch (err) {
        res.status(500).send({success: false, error: err})
    }
})



module.exports = router