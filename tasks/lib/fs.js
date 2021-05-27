'use strict'

const ospath = require('path')
const fs = require('fs').promises

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

async function getBuildDirectory() {
  // Create build directory (if it does not exist)
  if (!await directoryExists(buildDirectoryPath)) {
    await fs.mkdir(buildDirectoryPath)
  }
  return buildDirectoryPath
}

module.exports = {
  directoryExists,
  fileExists,
  getIssueDirectory,
  getCommunityMemberData,
  getBlogPost,
  getImagesDirectory,
  getCommunityMemberImage,
  getBuildDirectory
}
