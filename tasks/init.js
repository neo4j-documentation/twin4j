'use strict'

const ospath = require('path')
const fs = require('fs').promises

const inquirer = require('inquirer')
const chalk = require('chalk')
inquirer.registerPrompt('date', require('inquirer-date-prompt'))

const { getIssueDate, getIssueDirectory, getIssueDirectoryName, directoryExists } = require('./lib/data.js')
const template = require('../resources/blog-post-template.js')

// TODO:
// - init: create file structure, json, and initialize the blog-post.adoc with community member and author
// - generate-tweets:
//   * create tweet files and add URL to tweet files (from document structure)
async function askIssueDate(date) {
  const { timestamp } = await inquirer.prompt({
    type: 'date',
    name: 'timestamp',
    message: 'When is the date of publication? (next Saturday)',
    prefix: ' 📅 ',
    default: date,
    locale: 'en-US',
    format: { month: 'short', hour: undefined, minute: undefined },
    clearable: true,
  })
  return new Date(timestamp)
}

async function getBlogPostAuthor(defaultAuthorName) {
  const { blogPostAuthor } = await inquirer.prompt({
    name: 'blogPostAuthor',
    default: defaultAuthorName,
    message: 'What is the name of the author of the blog post?',
    prefix: ' 📝 ',
    validate: (input) => nonEmpty(input)
  })
  return blogPostAuthor
}

async function getBlogPostCategories(defaultCategories) {
  const { blogPostCategories } = await inquirer.prompt({
    name: 'blogPostCategories',
    default: defaultCategories,
    message: 'What are the categories of the blog post? (slugs separated by comma)',
    prefix: ' 🔖 ️',
    validate: (input) => nonEmpty(input)
  })
  return blogPostCategories
}

async function getFeaturedCommunityMemberFirstName() {
  const { featuredCommunityMemberFirstName } = await inquirer.prompt({
    name: 'featuredCommunityMemberFirstName',
    message: 'What is the first name of the featured community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMemberFirstName
}

async function getFeaturedCommunityMemberLastName() {
  const { featuredCommunityMemberLastName } = await inquirer.prompt({
    name: 'featuredCommunityMemberLastName',
    message: 'What is the last name of the featured community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMemberLastName
}

async function hasAnotherFeaturedCommunityMember() {
  const { hasAnotherFeaturedCommunityMember } = await inquirer.prompt({
    name: 'hasAnotherFeaturedCommunityMember',
    message: 'Is there another featured community member this week?',
    prefix: ' ✨ ',
    type: 'confirm',
    default: false
  })
  return hasAnotherFeaturedCommunityMember
}

async function getSecondFeaturedCommunityMemberFirstName() {
  const { secondFeaturedCommunityMemberFirstName } = await inquirer.prompt({
    name: 'secondFeaturedCommunityMemberFirstName',
    message: 'What is the first name of the second featured community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return secondFeaturedCommunityMemberFirstName
}

async function getSecondFeaturedCommunityMemberLastName() {
  const { secondFeaturedCommunityMemberLastName } = await inquirer.prompt({
    name: 'secondFeaturedCommunityMemberLastName',
    message: 'What is the last name of the second featured community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return secondFeaturedCommunityMemberLastName
}

async function getFeaturedCommunityMembersTitle() {
  const { featuredCommunityMembersTitle } = await inquirer.prompt({
    name: 'featuredCommunityMembersTitle',
    message: 'What is the job title of the featured community member(s)?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMembersTitle
}

function nonEmpty(input) {
  const result = input && input.trim().length > 0
  if (!result) {
    console.error(chalk.redBright.bold('\n     !!! Must not be empty'))
  }
  return result
}

function nextDate(dayIndex) {
  var today = new Date()
  today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1)
  return today
}

const args = process.argv.slice(2)
const issueDateArg = args[0]

;(async () => {
  try {
    let issueDate
    if (issueDateArg) {
      issueDate = getIssueDate(issueDateArg)
    } else {
      // sunday is 0, saturday is 6
      const date = nextDate(6)
      issueDate = await askIssueDate(date)
    }
    const issueDirectoryName = getIssueDirectoryName(issueDate)
    const rootDirectoryPath = ospath.join(__dirname, '..')
    const issueDirectoryPath = ospath.join(rootDirectoryPath, 'docs', issueDirectoryName)
    if (await directoryExists(issueDirectoryPath)) {
      console.error(chalk.redBright.bold(`     !!! Directory ${ospath.relative(rootDirectoryPath, issueDirectoryPath)} already exists, cannot initialize a new Twin4j newsletter`))
      process.exit(9)
    }
    const blogPostAuthor = await getBlogPostAuthor('Elaine Rosenberg')
    const blogPostCategories = await getBlogPostCategories('graph-database')
    const featuredCommunityMemberFirstName = await getFeaturedCommunityMemberFirstName()
    const featuredCommunityMemberLastName = await getFeaturedCommunityMemberLastName()
    const anotherFeaturedCommunityMember = await hasAnotherFeaturedCommunityMember()
    const featuredCommunityMembers = [
      {
        firstName: featuredCommunityMemberFirstName,
        lastName: featuredCommunityMemberLastName,
        fullName: `${featuredCommunityMemberFirstName} ${featuredCommunityMemberLastName}`
      }
    ]
    const communityMembers = [{
      name: `${featuredCommunityMemberFirstName} ${featuredCommunityMemberLastName}`,
      title: '',
      image: '<name>.jpeg'
    }]
    if (anotherFeaturedCommunityMember) {
      const secondFeaturedCommunityMemberFirstName = await getSecondFeaturedCommunityMemberFirstName()
      const secondFeaturedCommunityMemberLastName = await getSecondFeaturedCommunityMemberLastName()
      featuredCommunityMembers.push({
        firstName: secondFeaturedCommunityMemberFirstName,
        lastName: secondFeaturedCommunityMemberLastName,
        fullName: `${secondFeaturedCommunityMemberFirstName} ${secondFeaturedCommunityMemberLastName}`
      })
      communityMembers.push({
        name: `${secondFeaturedCommunityMemberFirstName} ${secondFeaturedCommunityMemberLastName}`,
        title: '',
        image: '<name>.jpeg'
      })
    }
    const featuredCommunityMembersTitle = await getFeaturedCommunityMembersTitle()
    for (const communityMember of communityMembers) {
      communityMember.title = featuredCommunityMembersTitle
    }
    await fs.mkdir(issueDirectoryPath, { recursive: true })
    await fs.mkdir(ospath.join(issueDirectoryPath, 'images'), { recursive: true })
    const blogPostContent = template({
      author: blogPostAuthor,
      categories: blogPostCategories,
      featuredCommunityMembers
    })
    await fs.writeFile(ospath.join(issueDirectoryPath, 'blog-post.adoc'), blogPostContent, 'utf8')
    await fs.writeFile(ospath.join(issueDirectoryPath, 'community-members.json'), JSON.stringify(communityMembers, null, 2), 'utf8')
  } catch (e) {
    console.error(e)
  }
})()
