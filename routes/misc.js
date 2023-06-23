const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get('/topfeeds/:tag', function (req, res) {
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


router.get('/latest/:tag', function (req, res) {
    const tag = req.params.tag

    let url = `${constants.mediumBaseUrl}/tag/${tag}/latest`

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


router.get('/tags/:tag/related', function (req, res) {
    const tag = req.params.tag

    let url = `${constants.mediumBaseUrl}/tag/${tag}/archive?format=json`

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


router.get('/tags/:tag/top-writers', function (req, res) {
    const tag = req.params.tag

    let url = `${constants.mediumBaseUrl}/tag/${tag}/top-writers`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({success: false, error: err})
        }

        const html = response.body

        const writerRegex = /\/@[A-Za-z0-9-.]+\?source=-[A-Za-z0-9]+/g
        const writers = html.match(writerRegex)

        const ids = writers.map(writer => {
            return writer.split('source=-')[1]
        })

        const uniqueIds = ids.filter((id, index, self) => {
            return self.indexOf(id) === index
        })

        res.send({success: true, data: uniqueIds})
    })
})


module.exports = router