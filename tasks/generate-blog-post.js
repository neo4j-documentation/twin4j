'use strict'

const ospath = require('path')
const fs = require('fs').promises

const asciidoctor = require('@asciidoctor/core')()

const { getBlogPost, getBuildDirectory } = require('./lib/data.js')
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
  const buildDirectory = await getBuildDirectory(issueDate)
  const outputFile = ospath.join(buildDirectory, `${slug}.html`)
  const doc = asciidoctor.convertFile(blogPostPath, {
    template_dirs: templateDirectoryPath,
    to_file: outputFile,
    mkdirs: true,
    standalone: false,
    extension_registry: registry,
    attributes: {
      linkattrs: ''
    }
  })
  return { outputFile, blogPostPath }
}

module.exports.generate = generate
