'use strict'

const debug = require('debug')('images')
const ospath = require('path')
const fs = require('fs').promises

const { getBuildImagesDirectory } = require('./lib/data.js')
const { getMedia, createMedia, updateMedia } = require('./lib/wp.js')

async function publish(issueDate) {
  const buildImagesDirectory = await getBuildImagesDirectory(issueDate)
  const images = await fs.readdir(buildImagesDirectory)
  for (const image of images) {
    const slug = ospath.basename(image, ospath.parse(image).ext)
    let mediaData
    if (slug.startsWith('this-week-in-neo4j-')) {
      mediaData = {
        title: slug,
        alt_text: 'This Week in Neo4j',
        caption: 'This Week in Neo4j',
        description: ''
      }
    } else {
      mediaData = {
        title: slug,
        alt_text: '',
        caption: '',
        description: ''
      }
    }
    const imagePath = ospath.join(buildImagesDirectory, image)
    const result = await getMedia(slug)
    if (result && result.length > 0) {
      const mediaId = result[0].id
      debug(`Image with slug ${slug} found, updating image with id: ${mediaId}...`)
      const response = await updateMedia(mediaId, imagePath, mediaData)
      console.log(`Image updated: ${response.source_url}`)
    } else {
      debug(`Image with slug: ${slug} not found, creating...`)
      const response = await createMedia(imagePath, mediaData)
      console.log(`Image created: ${response.source_url}`)
    }
  }
}

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run publish-images 2021-05-15`.')
  process.exit(9)
}

;(async () => {
  try {
    console.log(`Publishing images for Twin4j newsletter ${issueDate}...`)
    await publish(issueDate)
  } catch (e) {
    console.error('Something wrong happened!', e)
  }
})()
