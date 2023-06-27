const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get('/:tag/related', function (req, res) {
    const tag = req.params.tag

    let url = `${constants.mediumApiUrl}/tags/${tag}/related`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({success: false, error: err})
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const tags = parsedBody.payload.relatedTags.map(tag => tag.name)

        res.send({success: true, data: tags})
    })
})


router.get('/:tag/top-writers', async function (req, res) {
    const count = req.query.count
    const tag = req.params.tag

    let baseUrl = `${constants.mediumApiUrl}/tags/${tag}/top-writers/stream?limit=50`

    let url = baseUrl

    let writers = []
    let previousFrom = null

    const getWriters = async () => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    console.error(err)
                    return res.status(500).send({success: false, error: err})
                }


                const parsedBody = utils.formatMediumResponse(response)

                if (!parsedBody.success) {
                    return res.status(404).send({ success: false, error: parsedBody.error })
                }

                const paging = parsedBody.payload.paging

                if (!paging.next) {
                    return resolve()
                }

                if (parsedBody.success && parsedBody.payload.paging.next.from === previousFrom) {
                    return resolve()
                }
                const users = parsedBody.payload.references.User

                const writerIds = users ? Object.keys(users) : []
                writers = writers.concat(writerIds)

                if (writers.length >= count) {
                    writers = writers.slice(0, count)
                    return resolve()
                }

                if (paging.next.from !== previousFrom) {
                    previousFrom = paging.next.from
                    url = `${baseUrl}&from=${paging.next.from}`
                    return resolve(getWriters())
                } else {
                    resolve()
                }
            })
        })
    }

    try {
        await getWriters()
        res.send({success: true, data: writers.slice(0, count)})
    }
    catch (err) {
        res.status(500).send({success: false, error: err})
    }
})



router.get('/:tag/posts', function (req, res) {
    const tag = req.params.tag
    const mode = req.query.mode || 'hot'

    let url = `${constants.mediumBaseUrl}/tag/${tag}`

    switch (mode) {
        case 'new':
            url += '/latest'
            break
        case 'top_year':
            url += '/top/year'
            break
        case 'top_month':
            url += '/top/month'
            break
        case 'top_week':
            url += '/top/week'
            break
        case 'top_all_time':
            url += '/top/all-time'
            break
    }

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({success: false, error: err})
        }

        const html = response.body

        const postRegex = /Post:[a-z0-9]+/g
        const posts = html.match(postRegex)

        const postsData = posts.map(post => {
            return post.split(':')[1]
        })

        res.send({success: true, data: postsData})
    })
})


module.exports = router