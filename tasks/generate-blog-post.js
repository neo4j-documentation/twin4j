'use strict'

const ospath = require('path')
const asciidoctor = require('@asciidoctor/core')()

const tweetExtension = require('../resources/extensions/tweet-block-macro.js')

const workingDirectoryPath = ospath.join(__dirname, '..', 'docs', '2021-05-15')
const templateDirectoryPath = ospath.join(__dirname, '..', 'resources', 'templates', 'blog')

const registry = asciidoctor.Extensions.create()
tweetExtension(registry)

const html = asciidoctor.convertFile(ospath.join(workingDirectoryPath, 'blog-post.adoc'), {
  'template_dirs': templateDirectoryPath,
  to_file: false,
  attributes: {
    noheader: ''
  },
  extension_registry: registry
})

console.log(html)
