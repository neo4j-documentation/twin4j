'use strict'

const ospath = require('path')
const fs = require('fs').promises

const asciidoctor = require('@asciidoctor/core')()

const { getBlogPost } = require('./lib/fs.js')
const { getBlogPostSlug } = require('./lib/date.js')
const tweetExtension = require('../resources/extensions/tweet-block-macro.js')
const featuredExtension = require('../resources/extensions/featured-block-macro.js')

const templateDirectoryPath = ospath.join(__dirname, '..', 'resources', 'templates', 'blog')
const registry = asciidoctor.Extensions.create()
tweetExtension(registry)
featuredExtension(registry)

async function generate(issueDate) {
  const blogPostPath = await getBlogPost(issueDate)
  const document = asciidoctor.loadFile(blogPostPath, { header_only: true })
  const slug = document.getAttribute('slug')
  if (!slug) {
    console.error(`Slug is mandatory, please define a :slug: attribute in ${blogPostPath}.`)
    process.exit(9)
  }
  const outputFile = ospath.join(__dirname, '..', 'build', `${slug}.html`)
  const doc = asciidoctor.convertFile(blogPostPath, {
    template_dirs: templateDirectoryPath,
    to_file: outputFile,
    mkdirs: true,
    standalone: false,
    extension_registry: registry
  })
  console.log(doc.getDocumentTitle())
}

module.exports.generate = generate
