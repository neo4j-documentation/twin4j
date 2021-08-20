'use strict'

const ospath = require('path')
const fs = require('fs').promises
const asciidoctor = require('@asciidoctor/core')()

const { getIssueDirectory, getBlogPost } = require('./lib/data.js')

const tweetFiles = {
  'featured-community-member': '1-sat-00-00.txt',
  'features-1': '2-sat-05-00.txt',
  'features-2': '3-sat-14-00.txt',
  'features-3': '4-sat-21-00.txt',
  'features-4': '5-sun-09-00.txt',
  'features-5': '6-sun-16-00.txt',
  'features-6': '7-sun-23-00.txt',
  'features-7': '8-mon-02-00.txt'
}

const rootDirectory = ospath.join(__dirname, '..')

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run init-tweets 2021-05-15`.')
  process.exit(9)
}

function getHashTagsLine(section) {
  const hashtagsValue = section.getAttribute('hashtags', '').trim()
  const hashtags = hashtagsValue ? hashtagsValue.split(',').map((hashtag) => hashtag.trim()) : []
  hashtags.unshift('neo4j')
  return Array.from(new Set(hashtags)).map((hashtag) => `#${hashtag}`).join(' ')
}

function getTweetContent(blogPostSlug, section) {
  return `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#${section.getId()}\n\n${getHashTagsLine(section)}`
}

;(async () => {
  const issueDirectoryPath = await getIssueDirectory(issueDate)
  const blogPostPath = await getBlogPost(issueDate)
  const tweetsDirectory = ospath.join(issueDirectoryPath, 'tweets')
  await fs.mkdir(tweetsDirectory, { recursive: true })
  const tweets = await fs.readdir(tweetsDirectory)
  if (tweets && tweets.length > 0) {
    console.error(`Tweets directory ${ospath.relative(rootDirectory, tweetsDirectory)} is not empty, if you want to initalize tweets again, delete this directory and run the command again.`)
    process.exit(9)
  }
  // get slug
  const document = asciidoctor.loadFile(blogPostPath)
  const blogPostSlug = document.getAttribute('slug')
  if (!blogPostSlug) {
    console.error(`Slug is mandatory, please define a :slug: attribute in ${blogPostPath}.`)
    process.exit(9)
  }
  if (!blogPostSlug.startsWith('this-week-in-neo4j-')) {
    console.error(`Slug must start with 'this-week-in-neo4j-', please update the :slug: attribute in ${blogPostPath}.`)
    process.exit(9)
  }
  const sections = document.getSections()
  for (const section of sections) {
    const tweetFile = tweetFiles[section.getId()]
    if (tweetFile) {
      await fs.writeFile(ospath.join(tweetsDirectory, tweetFile), getTweetContent(blogPostSlug, section), 'utf8')
    }
  }
  // summary tweet
  await fs.writeFile(ospath.join(tweetsDirectory, '9-tue-12-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/\n\n#neo4j`, 'utf8')
})()
