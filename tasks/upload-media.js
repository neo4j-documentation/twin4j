'use strict'

const debug = require('debug')('media')
const ospath = require('path')
const WPAPI = require('wpapi')

const wpEndpoint = process.env['WORDPRESS_ENDPONT'] || 'https://neo4j.com/wp-json'
const wpUsername = process.env['WORDPRESS_USERNAME']
const wpPassword = process.env['WORDPRESS_PASSWORD']

const wp = new WPAPI({
  endpoint: wpEndpoint,
  username: wpUsername,
  password: wpPassword,
})

const basename = 'this-week-in-neo4j-24-may-2021'
const imagePath = ospath.join(__dirname, '..', 'build', `${basename}.jpeg`)

async function getMedia(slug) {
  return new Promise((resolve, reject) => {
    wp.media().slug(basename)
      .then(function (response) {
        resolve(response)
      })
      .catch((err) => reject(err))
  })
}

async function updateMedia(id, filePath, data) {
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
  return new Promise((resolve, reject) => {
    wp.media()
      .file(filePath)
      .create(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

;(async () => {
  try {
    const result = await getMedia(basename)
    const mediaData = {
      title: basename,
      alt_text: 'This Week in Neo4j',
      caption: 'This Week in Neo4j',
      description: ''
    }
    if (result && result.length > 0) {
      const mediaId = result[0].id
      debug(`media with slug ${basename} found, updating media id ${mediaId}...`)
      await updateMedia(mediaId, imagePath, mediaData)
    } else {
      debug(`media with slug ${basename} not found, creating...`)
      await createMedia(imagePath, mediaData)
    }
  } catch (err) {
    console.error('Something went wrong!', err)
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
