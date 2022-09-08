'use strict'

const formatErrorCode = (error) => {
  const errorcodes = {
    1000: 'Invalid request',
    1001: 'Insertion failed',
    1002: 'Info check failed',
    1003: 'Customer already exists'
  }
  if (errorcodes[error]) return { errorcode: error, message: errorcodes[error] }
  else return { errorcode: error, message: 'Unknown Error!' }
}

const inputValidation = (body) => {
  return new Promise((resolve, reject) => {
    if (!body.customerid || !body.score) return reject(formatErrorCode(1000))
    else return resolve(body)
  })
}

const queryDynamoDB = (body) => {
  return new Promise((resolve, reject) => {
    const params = {
      ExpressionAttributeValues: {
        ':cstid': {
          S: body.customerid
        }
      },
      KeyConditionExpression: 'customerid = :cstid',
      TableName: 'scores-table'
    }
    const AWS = require('aws-sdk')
    const dynamodb = new AWS.DynamoDB()
    dynamodb.query(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
        return reject(formatErrorCode(1002))
      } else {
        if (data.Count === 1) return reject(formatErrorCode(1003))
        else return resolve(data)
      }
    })
  })
}
const insertIntoDynamoDB = (body) => {
  return new Promise((resolve, reject) => {
    const params = {
      Item: {
        customerid: {
          S: body.customerid
        },
        score: {
          N: JSON.stringify(body.score)
        },
        created: {
          S: JSON.stringify(new Date())
        }
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: 'scores-table'
    }
    const AWS = require('aws-sdk')
    const dynamodb = new AWS.DynamoDB()
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
        return reject(formatErrorCode(1001))
      } else {
        console.log(data) // successful response
        return resolve(data)
      }
    })
  })
}

module.exports = {
  inputValidation,
  insertIntoDynamoDB,
  queryDynamoDB
}
