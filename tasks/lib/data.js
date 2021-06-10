'use strict'

const ospath = require('path')
const fs = require('fs').promises
const debugImages = require('debug')('images')
const luxon = require('luxon')
const DateTime = luxon.DateTime

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

class ArgumentOutOfRangeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ArgumentOutOfRangeError'
  }
}

const rootDirectoryPath = ospath.join(__dirname, '..', '..')
const buildDirectoryPath = ospath.join(rootDirectoryPath, 'build')
const docsDirectoryPath = ospath.join(rootDirectoryPath, 'docs')

async function directoryExists(path) {
  return fs.stat(path)
    .then((stat) => stat.isDirectory())
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return false
      }
      throw err
    })
}

async function fileExists(path) {
  return fs.stat(path)
    .then((stat) => stat.isFile())
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return false
      }
      throw err
    })
}

async function getCommunityMemberImage(issueDate, file) {
  const imagesDirectoryPath = await getImagesDirectory(issueDate)
  const imageFilePath = ospath.join(imagesDirectoryPath, file)
  if (!await fileExists(imageFilePath)) {
    console.error(`Community member image is missing from ${imagesDirectoryPath}, make sure that you have a file named '${file}' inside images directory.`)
    process.exit(9)
  }
  return imageFilePath
}

async function getImagesDirectory(issueDate) {
  const issueDirectoryPath = await getIssueDirectory(issueDate)
  const imagesDirectoryPath = ospath.join(issueDirectoryPath, 'images')
  if (!await directoryExists(imagesDirectoryPath)) {
    console.error(`Images directory is missing from ${issueDirectoryPath}, make sure that you have a directory named 'images' inside ${issueDate} directory.`)
    process.exit(9)
  }
  return imagesDirectoryPath
}

function getIssueDirectoryName(issueDate) {
  const yyyy = issueDate.getUTCFullYear()
  const mm = ('0' + (issueDate.getUTCMonth() + 1)).slice(-2)
  const dd = ('0' + (issueDate.getUTCDate())).slice(-2)
  return `${yyyy}-${mm}-${dd}`
}

async function getIssueDirectory(issueDate) {
  const issueDirectoryPath = ospath.join(docsDirectoryPath, issueDate)
  if (!await directoryExists(issueDirectoryPath)) {
    console.error(`Directory ${issueDirectoryPath} does not exist, make sure that the issue date is correct.`)
    process.exit(9)
  }
  return issueDirectoryPath
}

async function getCommunityMemberData(issueDate) {
  const issueDirectoryPath = ospath.join(docsDirectoryPath, issueDate)
  const communityMemberJsonFilePath = ospath.join(issueDirectoryPath, 'community-member.json')
  if (!await fileExists(communityMemberJsonFilePath)) {
    console.error(`Community member JSON file is missing from ${issueDirectoryPath}, make sure that you have a file named 'community-member.json' inside ${issueDate} directory.`)
    process.exit(9)
  }
  try {
    return require(communityMemberJsonFilePath)
    // TODO: check that the JSON contains all the mandatory data
  } catch (e) {
    console.error(`Unable to load ${communityMemberJsonFilePath}, aborting.`, e)
    process.exit(9)
  }
}

async function getBlogPost(issueDate) {
  const issueDirectoryPath = ospath.join(docsDirectoryPath, issueDate)
  const blogPostPath = ospath.join(issueDirectoryPath, 'blog-post.adoc')
  if (!await fileExists(blogPostPath)) {
    console.error(`Blog post is missing from ${issueDirectoryPath}, make sure that you have a file named 'blog-post.adoc' inside ${issueDate} directory.`)
    process.exit(9)
  }
  return blogPostPath
}

async function getBuildBlogPost(issueDate, slug) {
  const buildDirectory = await getBuildDirectory(issueDate)
  const blogPostHtmlFile = ospath.join(buildDirectory, `${slug}.html`)
  if (!await fileExists(blogPostHtmlFile)) {
    console.error(`Blog post is missing from ${buildDirectory}.`)
    process.exit(9)
  }
  return blogPostHtmlFile
}

async function getBuildDirectory(issueDate) {
  // Create build directory (if it does not exist)
  if (!await directoryExists(buildDirectoryPath)) {
    await fs.mkdir(buildDirectoryPath)
  }
  const issueDateBuildDirectory = ospath.join(buildDirectoryPath, issueDate)
  if (!await directoryExists(issueDateBuildDirectory)) {
    await fs.mkdir(issueDateBuildDirectory)
  }
  return issueDateBuildDirectory
}

async function getBuildImagesDirectory(issueDate) {
  const buildDirectory = await getBuildDirectory(issueDate)
  const imagesBuildDirectory = ospath.join(buildDirectory, 'images')
  if (!await directoryExists(imagesBuildDirectory)) {
    await fs.mkdir(imagesBuildDirectory)
  }
  return imagesBuildDirectory
}

function getIssueDate(issueDate) {
  const date = new Date(`${issueDate}T00:00:00Z`)
  if (!(date instanceof Date) || isNaN(date)) {
    console.error(`Issue date ${issueDate} is not a valid date, please use yyyy-MM-dd format, for instance: 2021-02-04 (February 4th, 2021).`)
    process.exit(9)
  }
  return date
}

function getCommunityMemberImageSlug(issueDate) {
  const date = getIssueDate(issueDate)
  const yyyy = date.getUTCFullYear()
  const month = monthNames[date.getUTCMonth()]
  const dd = ('0' + (date.getUTCDate())).slice(-2)
  return `this-week-in-neo4j-${dd}-${month}-${yyyy}`
}

const validImageExtensions = ['.jpeg', '.jpg', '.png', '.svg']

function isValidImageFile(image) {
  if (image.startsWith('.')) {
    return {
      result: false,
      message: `Ignoring hidden file ${image}`
    }
  }
  const imageExt = ospath.parse(image).ext
  if (!imageExt) {
    return {
      result: false,
      message: `Ignoring file ${image} without extension`
    }
  }
  if (!validImageExtensions.includes(imageExt.toLowerCase())) {
    return {
      result: false,
      message: `Ignoring file ${image}, invalid image file extension, must be one of: ${validImageExtensions.join(', ')}`
    }
  }
  return {
    result: true,
    message: ''
  }
}

function getDateAtTime(dateTime, hour) {
  return DateTime.fromObject({year: dateTime.year, month: dateTime.month, day: dateTime.day, hour, zone: 'America/Los_Angeles'})
}

function getTweetFile(dateTime) {
  // we send tweets on monday (1), tuesday (2), saturday (6), and sunday (7)
  // time is Pacific Time which is either UTC-7 Pacific Daylight Time (PDT) or UTC-8 Pacific Standard Time (PST) from early November to mid-March
  let tweetFile = ''
  if (dateTime.weekday === 1 || dateTime.weekday === 2 || dateTime.weekday === 6 || dateTime.weekday === 7) {
    // find a tweet within a -5 minutes / +5 minutes range
    const startRangeDateTime = dateTime.minus({ minutes: 5 })
    const endRangeDateTime = dateTime.plus({ minutes: 5 })
    if (dateTime.weekday === 1) {
      // monday at 02:00
      const dateTime0200 = getDateAtTime(dateTime, 2)
      // tweet date is between range
      if (startRangeDateTime <= dateTime0200 && dateTime0200 <= endRangeDateTime) {
        tweetFile = `7-mon-02-00.txt`
      } else {
        throw new ArgumentOutOfRangeError(`Tweet window ${dateTime0200} is not between ${startRangeDateTime} and ${endRangeDateTime}.`)
      }
    } else if (dateTime.weekday === 2) {
      // tuesday at 12:00
      const dateTime1200 = getDateAtTime(dateTime, 12)
      // tweet date is between range
      if (startRangeDateTime <= dateTime1200 && dateTime1200 <= endRangeDateTime) {
        tweetFile = `8-tue-12-00.txt`
      } else {
        throw new ArgumentOutOfRangeError(`Tweet window ${dateTime1200} is not between ${startRangeDateTime} and ${endRangeDateTime}.`)
      }
    } else if (dateTime.weekday === 6) {
      // saturday at 00:00
      const dateTime0000 = getDateAtTime(dateTime, 0)
      // saturday at 05:00
      const dateTime0500 = getDateAtTime(dateTime, 5)
      // saturday at 14:00
      const dateTime1400 = getDateAtTime(dateTime, 14)
      // saturday at 21:00
      const dateTime2100 = getDateAtTime(dateTime, 21)
      // tweet date is between range
      if (startRangeDateTime <= dateTime0000 && dateTime0000 <= endRangeDateTime) {
        tweetFile = '1-sat-00-00.txt'
      } else if (startRangeDateTime <= dateTime0500 && dateTime0500 <= endRangeDateTime) {
        tweetFile = '2-sat-05-00.txt'
      } else if (startRangeDateTime <= dateTime1400 && dateTime1400 <= endRangeDateTime) {
        tweetFile = '3-sat-14-00.txt'
      } else if (startRangeDateTime <= dateTime2100 && dateTime2100 <= endRangeDateTime) {
        tweetFile = '4-sat-21-00.txt'
      } else {
        throw new ArgumentOutOfRangeError(`Tweet windows [${[dateTime0000, dateTime0500, dateTime1400, dateTime2100].join(', ')}] is not between ${startRangeDateTime} and ${endRangeDateTime}.`)
      }
    } else if (dateTime.weekday === 7) {
      // sunday at 09:00
      const dateTime0900 = getDateAtTime(dateTime, 9)
      // sunday at 16:00
      const dateTime1600 = getDateAtTime(dateTime, 16)
      // tweet date is between range
      if (startRangeDateTime <= dateTime0900 && dateTime0900 <= endRangeDateTime) {
        tweetFile = '5-sun-09-00.txt'
      } else if (startRangeDateTime <= dateTime1600 && dateTime1600 <= endRangeDateTime) {
        tweetFile = '6-sun-16-00.txt'
      } else {
        throw new ArgumentOutOfRangeError(`Tweet windows [${[dateTime0900, dateTime1600].join(', ')}] is not between ${startRangeDateTime} and ${endRangeDateTime}.`)
      }
    }
  } else {
    throw new ArgumentOutOfRangeError(`We do not tweet on ${dateTime.weekdayLong}.`)
  }
  return tweetFile
}

Date.prototype.stdTimezoneOffset = function () {
  var jan = new Date(this.getFullYear(), 0, 1)
  var jul = new Date(this.getFullYear(), 6, 1)
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
}

Date.prototype.isDstObserved = function () {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

module.exports = {
  directoryExists,
  fileExists,
  getIssueDate,
  getCommunityMemberImageSlug,
  getIssueDirectory,
  getIssueDirectoryName,
  getCommunityMemberData,
  getBlogPost,
  getImagesDirectory,
  getCommunityMemberImage,
  getBuildDirectory,
  getBuildImagesDirectory,
  getBuildBlogPost,
  isValidImageFile,
  getTweetFile,
  ArgumentOutOfRangeError
}
