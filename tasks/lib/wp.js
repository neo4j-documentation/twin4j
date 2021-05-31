'use strict'

const debug = require('debug')('wordpress')
const WPAPI = require('wpapi')

const wpEndpoint = process.env['WORDPRESS_ENDPOINT'] || 'https://neo4j.com/wp-json'
const wpUsername = process.env['WORDPRESS_USERNAME']
const wpPassword = process.env['WORDPRESS_PASSWORD']

const wp = new WPAPI({
  endpoint: wpEndpoint,
  username: wpUsername,
  password: wpPassword,
})

async function getTags(slugs) {
  debug(`Get tags...`)
  return new Promise((resolve, reject) => {
    getAll(wp.tags().slug(slugs).perPage(100))
      .then(function (allTags) {
        resolve(allTags)
      })
      .catch((err) => reject(err))
  })
}

async function getCategories(slugs) {
  debug(`Get categories...`)
  return new Promise((resolve, reject) => {
    getAll(wp.categories().slug(slugs).perPage(100))
      .then(function (allTags) {
        resolve(allTags)
      })
      .catch((err) => reject(err))
  })
}

async function getAllTags() {
  debug(`Get all tags...`)
  return new Promise((resolve, reject) => {
    getAll(wp.tags().perPage(100))
      .then(function (allTags) {
        resolve(allTags)
      })
      .catch((err) => reject(err))
  })
}

async function getAllCategories() {
  debug(`Get all categories...`)
  return new Promise((resolve, reject) => {
    getAll(wp.categories().perPage(100))
      .then(function (allCategories) {
        resolve(allCategories)
      })
      .catch((err) => reject(err))
  })
}

function getAll(request) {
  return request.then(function (response) {
    if (!response._paging || !response._paging.next) {
      return response
    }
    debug(`Fetching next page ${response._paging.next}`)
    // Request the next page and return both responses as one collection
    return Promise.all([
      response,
      getAll(response._paging.next)
    ]).then(function (responses) {
      return responses.flat()
    })
  })
}

async function findUser(name) {
  debug(`Find user with name: ${name}`)
  return new Promise((resolve, reject) => {
    wp.users()
      .search(name)
      .perPage(1)
      .page(1)
      .then(function (response) {
        resolve(response)
      })
      .catch((err) => reject(err))
  })
}

async function getMedia(slug) {
  debug(`Get media with slug: ${slug}`)
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

async function getPost(slug) {
  debug(`Get post with slug: ${slug}`)
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
  debug(`Update post with id: ${id} and data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.posts()
      .id(id)
      .update(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

async function createPost(data) {
  debug(`Create post with data: ${JSON.stringify(data)}.`)
  return new Promise((resolve, reject) => {
    wp.posts()
      .create(data)
      .then((response) => resolve(response))
      .catch((err) => reject(err))
  })
}

module.exports = {
  getPost,
  createPost,
  updatePost,
  getMedia,
  createMedia,
  updateMedia,
  getAllTags,
  getTags,
  getAllCategories,
  getCategories,
  findUser
}
