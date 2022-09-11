'use strict'
const express = require('express')
const app = express()

// Middleware to handle JSON
app.use(express.json())

// Dummy API for Health Check
app.get('/', async (req, res) => {
  const utils = require('./utils')
  const { v4: uuidv4 } = require('uuid');
  try {
    let body = {
      customerid: uuidv4(),
      score: Math.random() * (10000 - 1) + 1
    }
    await utils.inputValidation(body)

    await utils.queryDynamoDB(body)

    await utils.insertIntoDynamoDB(body)

    res.json({ success: body.customerid })
  } catch (error) {

    console.log('Main Post Error ===> ', error)

    await utils.publishSNS(body,error)

    res.status(400).json(error)
  }
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
