'use strict'

const asciidoctor = require('@asciidoctor/core')()

const { getBlogPost } = require('./lib/data.js')

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run get-slug 2021-05-15`.')
  process.exit(9)
}

function slugify(value) {
  return value.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\x00-\x7F]/g, '-')
    .replace(/[^a-zA-Z\d]/g, '-')
    .replace(/-{2,}/g, '-')
}

;(async () => {
  try {
    const blogPostPath = await getBlogPost(issueDate)
    const document = asciidoctor.loadFile(blogPostPath, { header_only: true })
    const documentTitle = document.getDocumentTitle()
    console.log(slugify(documentTitle))
  } catch (err) {
    console.error('Something wrong happened!', err)
  }
})()
