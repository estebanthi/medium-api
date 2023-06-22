'use strict'
const express = require('express')

// Create the express app
const app = express()

// Routes and middleware
const usersRouter = require('./routes/users')

app.use('/users', usersRouter)


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