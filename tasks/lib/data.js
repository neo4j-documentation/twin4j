'use strict'

const ospath = require('path')
const fs = require('fs').promises
const debugImages = require('debug')('images')

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
  getCommunityMemberData,
  getBlogPost,
  getImagesDirectory,
  getCommunityMemberImage,
  getBuildDirectory,
  getBuildImagesDirectory,
  getBuildBlogPost,
  isValidImageFile
}
