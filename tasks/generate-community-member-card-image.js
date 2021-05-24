const fs = require('fs').promises
const ospath = require('path')
const os = require('os')
const puppeteer = require('puppeteer')

const imagesDir = ospath.join(__dirname, '..', 'resources', 'images')
const buildDir = ospath.join(__dirname, '..', 'build')
const template = require('../resources/community-member-card-template.js')

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

async function generateCommunityMemberCardHtml(data) {
  const avatarBuffer = await fs.readFile(ospath.join(imagesDir, data.communityMember.image))
  const avatarDataUri = `data:image/gif;base64,${avatarBuffer.toString('base64')}`
  const backgroundImageBuffer = await fs.readFile(ospath.join(imagesDir, `twin4j-fcm-template-with-logo.jpeg`))
  const backgroundDataUri = `data:image/gif;base64,${backgroundImageBuffer.toString('base64')}`
  return template({ ...data, backgroundDataUri, avatarDataUri })
}

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

async function generateCommunityMemberCardImage(puppeteerPage, page, dest) {
  await puppeteerPage.goto(page.url)
  // Background is 800x400
  await puppeteerPage.setViewport({ width: 800, height: 400 })
  const imagePath = ospath.join(buildDir, dest)
  await puppeteerPage.screenshot({ path: imagePath, quality: 95 })
}

async function generate(data) {
  // Create build directory (if it does not exist)
  if (!await directoryExists(buildDir)) {
    await fs.mkdir(buildDir)
  }
  // Start browser
  const browser = await puppeteer.launch()
  try {
    const puppeteerPage = await browser.newPage()
    const html = await generateCommunityMemberCardHtml(data)
    const date = data.date
    const yyyy = date.getFullYear()
    const month = monthNames[date.getMonth()].toLowerCase()
    const dd = ('0' + (date.getDate())).slice(-2)
    const basename = `this-week-in-neo4j-${dd}-${month}-${yyyy}`
    const tempFilePath = ospath.join(buildDir, `${basename}.html`)
    await fs.writeFile(tempFilePath, html, 'utf8')
    const url = `file://${tempFilePath}`
    await generateCommunityMemberCardImage(puppeteerPage, { url }, `${basename}.jpeg`)
  } finally {
    await browser.close()
  }
}

generate({
  communityMember: {
    name: 'Camilla Dal Rio',
    title: 'Consultant at Moviri',
    image: 'camilla-dal-rio.jpeg'
  },
  date: new Date(Date.UTC(2021, 5, 22))
})

