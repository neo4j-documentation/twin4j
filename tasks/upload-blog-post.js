'use strict'

const debug = require('debug')('blog-post')
const ospath = require('path')
const fs = require('fs').promises
const WPAPI = require('wpapi')

const { getBuildDirectory } = require('./lib/data.js')

const wpEndpoint = process.env['WORDPRESS_ENDPOINT'] || 'https://neo4j.com/wp-json'
const wpUsername = process.env['WORDPRESS_USERNAME']
const wpPassword = process.env['WORDPRESS_PASSWORD']

const wp = new WPAPI({
  endpoint: wpEndpoint,
  username: wpUsername,
  password: wpPassword,
})

async function getPost(slug) {
  return new Promise((resolve, reject) => {
    wp.posts()
      .slug(slug)
      .then(function (response) {
        resolve(response)
      })
      .catch((err) => reject(err))
  })
}

async function updatePost(id, data) {
  debug(`Update blog post with id: ${id} and data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.posts()
      .id(id)
      .update(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

async function createPost(data) {
  debug(`Create blog post with data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.posts()
      .create(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

async function upload(issueDate) {
  const buildDirectory = await getBuildDirectory(issueDate)
  const files = await fs.readdir(buildDirectory)
  for (const file of files) {
    if (file.endsWith('.html')) {
      const slug = ospath.basename(file, ospath.parse(file).ext)
      const result = await getPost(slug)

      // status = future
      // date_gmt: YYYY-MM-DDTHH:MM:SS => from issue date, publish at issue date GMT? UTC+0?
      // tags => AsciiDoc attribute :tags: (array of ids)
      // categories => AsciiDoc attribute :categories: (array of ids)
      // featured_media => get id from community member image
      // title => document title (AsciiDoc)
      // author => get id from author name (AsciiDoc attribute :author:)
      const blogPostData = {
        title: 'Your Post Title',
        content: 'Your post content',
        // Post will be created as a draft by default if a specific "status"
        // is not specified
      }
      if (result && result.length > 0) {
        const blogPostId = result[0].id
        debug(`Blog post with slug ${slug} found, updating blog post with id: ${blogPostId}...`)
      } else {
        debug(`Blog post with slug: ${slug} not found, creating...`)
      }
    }
  }
}

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run upload-blog-post 2021-05-15`.')
  process.exit(9)
}

;(async () => {
  try {
    console.log(`Uploading blog post for Twin4j newsletter ${issueDate}...`)
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
