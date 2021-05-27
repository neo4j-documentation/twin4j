'use strict'

const ospath = require('path')
const fs = require('fs').promises

const { getCommunityMemberData, getImagesDirectory, getBuildImagesDirectory } = require('./lib/data.js')

async function copyImages(issueDate) {
  const buildImagesDirectory = await getBuildImagesDirectory(issueDate)
  const imagesDirectory = await getImagesDirectory(issueDate)
  const communityMemberJson = await getCommunityMemberData(issueDate)
  const images = await fs.readdir(imagesDirectory)
  for (const image of images) {
    if (image === communityMemberJson.image) {
      continue // ignore!
    }
    await fs.copyFile(ospath.join(imagesDirectory, image), ospath.join(buildImagesDirectory, image))
  }
}

module.exports = {
  copyImages
}
