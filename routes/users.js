const express = require('express')
const request = require('request')
const constants = require('../const')
const utils = require("../utils");

const router = express.Router()


router.get('/id-for/:username', function (req, res) {

    const url = `${constants.mediumApiUrl}/users/@${req.params.username}`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send( {success: false, error: err })
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const userId = parsedBody.payload.value.userId
        res.send({ success: true, data: userId })


    })


})

router.get('/:userId', function (req, res) {
    const url = `${constants.mediumApiUrl}/users/${req.params.userId}/meta`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({ success: false, error: err })
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(404).send({ success: false, error: parsedBody.error })
        }

        const username = parsedBody.payload.references.User[req.params.userId].username
        const fullName = parsedBody.payload.references.User[req.params.userId].name
        const bio = parsedBody.payload.references.User[req.params.userId].bio
        const avatar = parsedBody.payload.references.User[req.params.userId].imageId ? utils.getMediumMediaUrl(parsedBody.payload.references.User[req.params.userId].imageId) : null
        const banner = parsedBody.payload.references.User[req.params.userId].backgroundImageId ? utils.getMediumMediaUrl(parsedBody.payload.references.User[req.params.userId].backgroundImageId) : null
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


router.get('/:userId/following', async function (req, res) {
    const count = req.query.count
    const baseUrl = `${constants.mediumApiUrl}/users/${req.params.userId}/following?limit=100`

    let following = []

    const getFollowing = async (url) => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    console.error(err)
                    return reject(err)
                }

                const parsedBody = utils.formatMediumResponse(response)

                if (!parsedBody.success) {
                    return reject(parsedBody.error)
                }

                if (parsedBody.success && !parsedBody.payload.paging.next) {
                    return resolve()
                }

                const users = parsedBody.payload.references.User
                const userIds = Object.keys(users)
                following = following.concat(userIds)

                if (count && following.length >= count) {
                    following = following.slice(0, count)
                    return resolve()
                }

                if (parsedBody.payload.paging.next) {
                    return resolve(getFollowing(`${baseUrl}&to=${parsedBody.payload.paging.next.to}`))
                }

                return resolve()
            })
        })
    }

    try {
        await getFollowing(baseUrl)
        res.send({ success: true, data: following })
    }
    catch (err) {
        res.status(500).send({ success: false, error: err })
    }


})


router.get('/:userId/followers', async function (req, res) {
    const count = req.query.count
    const baseUrl = `${constants.mediumApiUrl}/users/${req.params.userId}/followers?limit=100`

    let followers = []

    const getFollowers = async (url) => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    console.error(err)
                    return reject(err)
                }

                const parsedBody = utils.formatMediumResponse(response)

                if (!parsedBody.success) {
                    return reject(parsedBody.error)
                }

                if (parsedBody.success && !parsedBody.payload.paging.next) {
                    return resolve()
                }

                const users = parsedBody.payload.references.User
                const userIds = Object.keys(users)
                followers = followers.concat(userIds)

                if (count && followers.length >= count) {
                    followers = followers.slice(0, count)
                    return resolve()
                }

                if (parsedBody.payload.paging.next) {
                    return resolve(getFollowers(`${baseUrl}&to=${parsedBody.payload.paging.next.to}`))
                }

                return resolve()
            })
        })
    }

    try {
        await getFollowers(baseUrl)
        res.send({ success: true, data: followers })
    }
    catch (err) {
        res.status(500).send({success: false, error: err})
    }
})


router.get('/:userId/articles', async function (req, res) {
    const count = req.query.count
    const baseUrl = `${constants.mediumApiUrl}/users/${req.params.userId}/profile/stream?limit=150&page=10000`

    let posts = []

    const getPosts = async (url) => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    return reject(err)
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
                    return resolve(getPosts(`${baseUrl}&to=${parsedBody.payload.paging.next.to}`))
                }

                return resolve()
            })
        })
    }

    try {
        await getPosts(baseUrl)
        res.send({ success: true, data: posts })
    }
    catch (err) {
        res.status(500).send({success: false, error: err})
    }
})


router.get('/:userId/publications', function (req, res) {
    const url = `${constants.mediumApiUrl}/users/${req.params.userId}/collections`

    request(url, function (err, response, body) {
        if (err) {
            console.error(err)
            return res.status(500).send({ success: false, error: err })
        }

        const parsedBody = utils.formatMediumResponse(response)

        if (!parsedBody.success) {
            return res.status(500).send({ success: false, error: parsedBody.error })
        }

        const publications = parsedBody.payload.value
        const publicationIds = publications.map(publication => publication.id)
        res.send({ success: true, data: publicationIds })
    })
})


router.get('/:userId/top-articles', async function (req, res) {
    const count = req.query.count || 10
    const baseUrl = `${constants.mediumApiUrl}/users/${req.params.userId}/profile/stream?limit=150&page=10000`

    let posts = []

    const getPosts = async (url) => {
        return new Promise((resolve, reject) => {
            request(url, function (err, response, body) {
                if (err) {
                    return reject(err)
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

                if (parsedBody.payload.paging.next) {
                    return resolve(getPosts(`${baseUrl}&to=${parsedBody.payload.paging.next.to}`))
                }

                return resolve()
            })
        })
    }

    try {
        await getPosts(baseUrl)
        console.log(posts)
        const postsWithClaps = await Promise.all(posts.map(postId => {
            return new Promise((resolve, reject) => {
                const url = `${constants.mediumApiUrl}/posts/${postId}`
                request(url, function (err, response, body) {
                    if (err) {
                        return reject(err)
                    }

                    const parsedBody = utils.formatMediumResponse(response)

                    if (!parsedBody.success) {
                        return reject(parsedBody.error)
                    }

                    const post = parsedBody.payload.value
                    return resolve(post)
                })
            })
        }))
        console.log(postsWithClaps)

        const sortedPosts = postsWithClaps.sort((a, b) => {
            return b.virtuals.totalClapCount - a.virtuals.totalClapCount
        })

        const topPosts = sortedPosts.slice(0, count).map(post => post.id)
        res.send({ success: true, data: topPosts })
    }

    catch (err) {
        res.status(500).send({success: false, error: err})
    }

})



module.exports = router