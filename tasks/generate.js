'use strict'

const ospath = require('path')
const fs = require('fs').promises

const { generate: generateBlogPost } = require('./generate-blog-post.js')
const { generate: generateCommunityMemberCard } = require('./generate-community-member-card-image.js')
const { copyImages } = require('./copy-images.js')
const { getIssueDate, getIssueDirectory, getBuildDirectory } = require('./lib/data.js')

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
    await generateBlogPost(issueDate)
    await generateCommunityMemberCard(issueDate)
    await copyImages(issueDate)
  } catch (e) {
    console.error('Something wrong happened!', e)
  }
})()


