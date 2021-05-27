'use strict'

const debug = require('debug')('media')
const ospath = require('path')
const fs = require('fs').promises
const WPAPI = require('wpapi')

const { getBuildImagesDirectory } = require('./lib/data.js')

const wpEndpoint = process.env['WORDPRESS_ENDPOINT'] || 'https://neo4j.com/wp-json'
const wpUsername = process.env['WORDPRESS_USERNAME']
const wpPassword = process.env['WORDPRESS_PASSWORD']

const wp = new WPAPI({
  endpoint: wpEndpoint,
  username: wpUsername,
  password: wpPassword,
})

async function getMedia(slug) {
  return new Promise((resolve, reject) => {
    wp.media()
      .slug(slug)
      .then(function (response) {
        resolve(response)
      })
      .catch((err) => reject(err))
  })
}

async function updateMedia(id, filePath, data) {
  debug(`Update media from file: ${filePath} with id: ${id} and data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.media()
      .id(id)
      .file(filePath)
      .update(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

async function createMedia(filePath, data) {
  debug(`Create media from file: ${filePath} with data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.media()
      .file(filePath)
      .create(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

async function upload(issueDate) {
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
      debug(`Media with slug ${slug} found, updating media with id: ${mediaId}...`)
      const response = await updateMedia(mediaId, imagePath, mediaData)
      console.log(`Media updated: ${response.source_url}`)
    } else {
      debug(`Media with slug: ${slug} not found, creating...`)
      const response = await createMedia(imagePath, mediaData)
      console.log(`Media created: ${response.source_url}`)
    }
  }
}

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run upload-images 2021-05-15`.')
  process.exit(9)
}

;(async () => {
  try {
    console.log(`Uploading images for Twin4j newsletter ${issueDate}...`)
    await upload(issueDate)
  } catch (e) {
    console.log('Something wrong happened!', e)
  }
})()

/*
wp.media()
  // Specify a path to the file you want to upload, or a Buffer
  .file(imagePath)
  .create({
    title: basename,
    alt_text: 'This Week in Neo4j',
    caption: 'This Week in Neo4j',
    description: ''
  })
  .then(function (response) {
    // Your media is now uploaded: let's associate it with a post
    console.log({ response })
    // var newImageId = response.id
    // return wp.media().id( newImageId ).update({
    //   post: associatedPostId
    // })
  })
*/
/*
.then(function (response) {
  console.log('Media ID #' + response.id)
  console.log('is now associated with Post ID #' + response.post)
})
*/
