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
    message: 'What is the first name of the feature community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMemberFirstName
}

async function getFeaturedCommunityMemberLastName() {
  const { featuredCommunityMemberLastName } = await inquirer.prompt({
    name: 'featuredCommunityMemberLastName',
    message: 'What is the last name of the feature community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMemberLastName
}

async function getFeaturedCommunityMemberTitle() {
  const { featuredCommunityMemberTitle } = await inquirer.prompt({
    name: 'featuredCommunityMemberTitle',
    message: 'What is the job title of the feature community member?',
    prefix: ' ✨ ',
    validate: (input) => nonEmpty(input)
  })
  return featuredCommunityMemberTitle
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

function slugify(value) {
  return value.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\x00-\x7F]/g, '-')
    .replace(/[^a-zA-Z\d]/g, '-')
    .replace(/-{2,}/g, '-')
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
    const featuredCommunityMemberTitle = await getFeaturedCommunityMemberTitle()

    await fs.mkdir(issueDirectoryPath, { recursive: true })
    await fs.mkdir(ospath.join(issueDirectoryPath, 'images'), { recursive: true })
    const blogPostContent = template({
      author: blogPostAuthor,
      categories: blogPostCategories,
      featuredCommunityMember: {
        firstName: featuredCommunityMemberFirstName,
        lastName: featuredCommunityMemberLastName,
        fullName: `${featuredCommunityMemberFirstName} ${featuredCommunityMemberLastName}`
      }
    })
    await fs.writeFile(ospath.join(issueDirectoryPath, 'blog-post.adoc'), blogPostContent, 'utf8')
    const communityMember = {
      name: `${featuredCommunityMemberFirstName} ${featuredCommunityMemberLastName}`,
      title: featuredCommunityMemberTitle,
      image: "<name>.jpeg"
    }
    await fs.writeFile(ospath.join(issueDirectoryPath, 'community-member.json'), JSON.stringify(communityMember, null, 2), 'utf8')
  } catch (e) {
    console.error(e)
  }
})()
