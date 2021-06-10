'use strict'

const luxon = require('luxon')
const fs = require('fs').promises
const ospath = require('path')

const DateTime = luxon.DateTime
const { getIssueDirectory, getTweetFile } = require('./lib/data.js')
const { sendTweet } = require('./lib/twitter.js')

function findIssueDirectory(dateTime) {
  // get the closest *past* saturday
  if (dateTime.weekday !== 6) {
    if (dateTime.weekday < 6) {
      dateTime = dateTime.minus({ days: (dateTime.weekday + 1) })
    } else {
      // sunday - 1 = saturday
      dateTime = dateTime.minus({ days: 1 })
    }
  }
  return `${dateTime.year}-${('0' + dateTime.month).slice(-2)}-${('0' + dateTime.day).slice(-2)}`

  console.log(issueDirectoryName)
}

;(async () => {
  const dateTime = DateTime
    .now()
    .setLocale("en")
    .setZone("America/Los_Angeles")
  console.log(`Current date is: ${dateTime}`)
  try {
    const issueDate = getIssueDate(dateTime)
    const issueDirectoryPath = await getIssueDirectory(issueDate)
    const tweetsDirectory = ospath.join(issueDirectoryPath, 'tweets')
    const tweetFile = getTweetFile(dateTime)
    const status = await fs.readFile(ospath.join(tweetsDirectory, tweetFile), 'utf8')
    console.log(`Send tweet: ${status}`)
  } catch (err) {
    if (err.name === 'ArgumentOutOfRangeError') {
      console.error(err.message)
    } else {
      console.error(err)
    }
  }
})()
