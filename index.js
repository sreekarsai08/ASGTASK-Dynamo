'use strict'
const express = require('express')
const app = express()

// Middleware to handle JSON
app.use(express.json())

// Dummy API for Health Check
app.get('/', async (req, res) => {
  res.send('Success Commit')
})

// Post API
app.post('/', async (req, res) => {
  const utils = require('./utils')
  try {
    await utils.inputValidation(req.body)

    await utils.queryDynamoDB(req.body)

    await utils.insertIntoDynamoDB(req.body)

    res.json({ success: req.body.customerid })
  } catch (error) {

    console.log('Main Post Error ===> ', error)

    await utils.publishSNS(req.body,error)

    res.status(400).json(error)
  }
})

// App listen
app.listen(80, () => {
  console.log('app listening at 8080')
})
