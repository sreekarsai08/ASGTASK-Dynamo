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
    const dynamodb = new AWS.DynamoDB({region:'ap-south-1'})
    dynamodb.query(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
        return reject(err)
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
    const dynamodb = new AWS.DynamoDB({region:'ap-south-1'})
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
        return reject(err)
      } else {
        console.log(data) // successful response
        return resolve(data)
      }
    })
  })
}
const publishSNS = (body,error) => {
  return new Promise((resolve, reject) => {
    const params = {
      Message: JSON.stringify({body:body,error:error}),
      TopicArn: 'arn:aws:sns:ap-south-1:649971045389:WEBSERVER-SNS',
      Subject: 'Main Error Occurred!',
    }
    const AWS = require('aws-sdk')
    const sns = new AWS.SNS({region:'ap-south-1'})
    sns.publish(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
        return reject(formatErrorCode(1004))
      } else {
        return resolve(data)
      }
    })
  })
}
module.exports = {
  inputValidation,
  insertIntoDynamoDB,
  queryDynamoDB,
  publishSNS
}
