'use strict'

const ospath = require('path')
const { execSync } = require('child_process')
const fs = require('fs').promises
const debug = require('debug')('resize-images')
const { getCommunityMembersData } = require('./lib/data.js')

async function removeDir(dir) {
  return typeof fs.rm === 'function'
    // Introduced in Node 14.14.0
    ? fs.rm(dir, { recursive: true, force: true })
    // The recursive option is deprecated, using it triggers a deprecation warning in Node 16
    : fs.rmdir(dir, { recursive: true, force: true })
}

async function resizeImages(buildImagesDirectory, issueDate) {
  try {
    execSync(`"mogrify" "--version"`)
  } catch (e) {
    console.log("Unable to resize images, 'mogrify' command not found. Make sure that ImageMagick is correctly installed: https://imagemagick.org/script/download.php")
    return
  }
  const communityMemberJson = await getCommunityMembersData(issueDate)
  const thumbsDirectory = ospath.join(buildImagesDirectory, 'thumbs')
  await removeDir(thumbsDirectory)
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
  await removeDir(thumbsDirectory)
}

module.exports = {
  resizeImages
}
