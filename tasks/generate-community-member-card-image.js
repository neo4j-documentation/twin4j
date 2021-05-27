'use strict'

const fs = require('fs').promises
const ospath = require('path')
const puppeteer = require('puppeteer')

const { getCommunityMemberImage, getCommunityMemberData, getBuildDirectory } = require('./lib/fs.js')
const { getIssueDate, getMediaSlug } = require('./lib/date.js')

const imagesDir = ospath.join(__dirname, '..', 'resources', 'images')
const template = require('../resources/community-member-card-template.js')

async function generateCommunityMemberCardHtml(issueDate, data) {
  const communityMemberImage = await getCommunityMemberImage(issueDate, data.communityMember.image)
  const avatarBuffer = await fs.readFile(communityMemberImage)
  const avatarDataUri = `data:image/gif;base64,${avatarBuffer.toString('base64')}`
  const backgroundImageBuffer = await fs.readFile(ospath.join(imagesDir, `twin4j-fcm-template-with-logo.jpeg`))
  const backgroundDataUri = `data:image/gif;base64,${backgroundImageBuffer.toString('base64')}`
  return template({ ...data, backgroundDataUri, avatarDataUri })
}

async function generateCommunityMemberCardImage(puppeteerPage, page, dest) {
  await puppeteerPage.goto(page.url)
  // Background is 800x400
  await puppeteerPage.setViewport({ width: 800, height: 400 })
  await puppeteerPage.screenshot({ path: dest, quality: 95 })
}

async function generate(issueDate) {
  const communityMemberJson = await getCommunityMemberData(issueDate)
  const date = await getIssueDate(issueDate)
  const data = { ...communityMemberJson, date }
  const buildDir = await getBuildDirectory()
  // Start browser
  const browser = await puppeteer.launch()
  try {
    const puppeteerPage = await browser.newPage()
    const html = await generateCommunityMemberCardHtml(issueDate, data)
    const mediaSlug = getMediaSlug(issueDate)
    const tempFilePath = ospath.join(buildDir, `${mediaSlug}.html`)
    await fs.writeFile(tempFilePath, html, 'utf8')
    const url = `file://${tempFilePath}`
    await generateCommunityMemberCardImage(puppeteerPage, { url }, ospath.join(buildDir, `${mediaSlug}.jpeg`))
  } finally {
    await browser.close()
  }
}

module.exports = {
  generate
}
