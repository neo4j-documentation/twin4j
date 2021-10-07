'use strict'

const debug = require('debug')('generate')
const ospath = require('path')
const fs = require('fs').promises

const { generate: generateBlogPost } = require('./generate-blog-post.js')
const { generate: generateCommunityMemberCard } = require('./generate-community-member-card-image.js')
const { copyImages } = require('./copy-images.js')
const { resizeImages } = require('./resize-images.js')
const { getIssueDate, getIssueDirectory, getBuildDirectory } = require('./lib/data.js')

const rootDirectory = ospath.join(__dirname, '..')

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run generate 2021-05-15`.')
  process.exit(9)
}

;(async () => {
  try {
    await getIssueDirectory(issueDate)
    await getIssueDate(issueDate)
    console.log(`Generating Twin4j newsletter ${issueDate}...`)
    const generateBlogPostResult = await generateBlogPost(issueDate)
    debug(`Blog post generated: ${ospath.relative(rootDirectory, generateBlogPostResult.outputFile)}`)
    const generateCommunityMemberCardResult = await generateCommunityMemberCard(issueDate)
    debug(`Featured community member image generated: ${ospath.relative(rootDirectory, generateCommunityMemberCardResult.outputFile)}`)
    const copyImagesResult = await copyImages(issueDate)
    debug(`Images copied to: ${ospath.relative(rootDirectory, copyImagesResult.destinationDirectory)}`)
    // resize images
    resizeImages(copyImagesResult.destinationDirectory, issueDate)
  } catch (e) {
    console.error('Something wrong happened!', e)
  }
})()


