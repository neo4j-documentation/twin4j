'use strict'

const ospath = require('path')
const fs = require('fs').promises
const debug = require('debug')('copy-images')

const { getCommunityMemberData, getImagesDirectory, getBuildImagesDirectory, isValidImageFile } = require('./lib/data.js')

async function copyImages(issueDate) {
  const buildImagesDirectory = await getBuildImagesDirectory(issueDate)
  const imagesDirectory = await getImagesDirectory(issueDate)
  const communityMemberJson = await getCommunityMemberData(issueDate)
  const images = await fs.readdir(imagesDirectory)
  for (const image of images) {
    const isValidImage = isValidImageFile(image)
    if (!isValidImage.result) {
      debug(isValidImage.message)
      continue
    }
    if (image === communityMemberJson.image) {
      continue // ignore!
    }
    await fs.copyFile(ospath.join(imagesDirectory, image), ospath.join(buildImagesDirectory, image))
  }
  return { destinationDirectory: buildImagesDirectory }
}

module.exports = {
  copyImages
}
