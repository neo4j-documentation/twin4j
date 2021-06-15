'use strict'

const ospath = require('path')
const fs = require('fs').promises
const asciidoctor = require('@asciidoctor/core')()

const { getIssueDirectory, getBlogPost } = require('./lib/data.js')

const rootDirectory = ospath.join(__dirname, '..')

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run init-tweets 2021-05-15`.')
  process.exit(9)
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
    const sectionId = section.getId()
    if (sectionId === 'featured-community-member') {
      await fs.writeFile(ospath.join(tweetsDirectory, '1-sat-00-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#featured-community-member\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-1') {
      await fs.writeFile(ospath.join(tweetsDirectory, '2-sat-05-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-1\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-2') {
      await fs.writeFile(ospath.join(tweetsDirectory, '3-sat-14-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-2\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-3') {
      await fs.writeFile(ospath.join(tweetsDirectory, '4-sat-21-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-3\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-4') {
      await fs.writeFile(ospath.join(tweetsDirectory, '5-sun-09-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-4\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-5') {
      await fs.writeFile(ospath.join(tweetsDirectory, '6-sun-16-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-5\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-6') {
      await fs.writeFile(ospath.join(tweetsDirectory, '7-sun-23-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-6\n\n#neo4j`, 'utf8')
    } else if (sectionId === 'features-6') {
      await fs.writeFile(ospath.join(tweetsDirectory, '8-mon-02-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/#features-7\n\n#neo4j`, 'utf8')
    }
  }
  // summary tweet
  await fs.writeFile(ospath.join(tweetsDirectory, '9-tue-12-00.txt'), `In this week's #twin4j, \n\nhttps://neo4j.com/blog/${blogPostSlug}/\n\n#neo4j`, 'utf8')
})()
