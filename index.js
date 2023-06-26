'use strict'
const express = require('express')
const cors = require('cors')

// Create the express app
const app = express()

// Enable CORS
app.use(cors())

// Routes and middleware
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/articles')
const publicationsRouter = require('./routes/publications')
const miscRouter = require('./routes/misc')

app.use('/users', usersRouter)
app.use('/articles', postsRouter)
app.use('/publications', publicationsRouter)
app.use('/', miscRouter)


// Error handlers
app.use(function fourOhFourHandler (req, res) {
  res.status(404).send()
})
app.use(function fiveHundredHandler (err, req, res, next) {
  console.error(err)
  res.status(500).send()
})

// Start server
app.listen(process.env.PORT || 3000, function () {
    console.log(`Listening on port ${this.address().port}`)
})