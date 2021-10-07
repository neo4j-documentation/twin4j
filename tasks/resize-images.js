'use strict'

const ospath = require('path')
const { execSync } = require('child_process')
const fs = require('fs').promises
const debug = require('debug')('resize-images')
const { getCommunityMembersData } = require('./lib/data.js')

async function resizeImages(buildImagesDirectory, issueDate) {
  const communityMemberJson = await getCommunityMembersData(issueDate)
  const thumbsDirectory = ospath.join(buildImagesDirectory, 'thumbs')
  await fs.rmdir(thumbsDirectory, { recursive: true })
  const originalImages = await fs.readdir(buildImagesDirectory)
  await fs.mkdir(thumbsDirectory)
  execSync(`"mogrify" "-path" "thumbs/" "-thumbnail" "800x418>" ${originalImages.map(image => `"${image}"`).join(' ')}`, { cwd: buildImagesDirectory })
  const images = await fs.readdir(thumbsDirectory)
  for (const image of images) {
    if (image === communityMemberJson.image) {
      continue // ignore!
    }
    await fs.copyFile(ospath.join(thumbsDirectory, image), ospath.join(buildImagesDirectory, image))
  }
  // cleanup
  await fs.rmdir(thumbsDirectory, { recursive: true })
}

module.exports = {
  resizeImages
}
