'use strict'

const debug = require('debug')('blog-post')
const ospath = require('path')
const fs = require('fs').promises
const asciidoctor = require('@asciidoctor/core')()

const { getBuildDirectory, getBlogPost, getBuildBlogPost, getCommunityMemberImageSlug, getIssueDate } = require('./lib/data.js')
const { getPost, createPost, updatePost, getMedia, getTags, getCategories, findUser } = require('./lib/wp.js')

async function publish(issueDate) {
  const buildDirectory = await getBuildDirectory(issueDate)
  const blogPostPath = await getBlogPost(issueDate)
  const document = asciidoctor.loadFile(blogPostPath, { header_only: true })
  const slug = document.getAttribute('slug')
  if (!slug) {
    console.error(`Slug is mandatory, please define a :slug: attribute in ${blogPostPath}.`)
    process.exit(9)
  }
  const communityMemberImageSlug = getCommunityMemberImageSlug(issueDate)
  const media = await getMedia(communityMemberImageSlug)
  if (!media || media.length === 0) {
    console.error(`Community member image with slug: ${communityMemberImageSlug} not found on WordPress, please upload images before uploading blog post.`)
    process.exit(9)
  }
  const tags = document.getAttribute('tags', '')
  const categories = document.getAttribute('categories', '')
  const authorName = document.getAttribute('author')
  const documentTitle = document.getDocumentTitle({sanitize: true})
  const blogPostHtmlFile = await getBuildBlogPost(issueDate, slug)
  const content = await fs.readFile(blogPostHtmlFile, 'utf8')
  const result = await getPost(slug)
  const featuredMediaId = media[0].id
  const wpTags = await getTags(tags.split(',').map(tag => tag.trim()).concat(['twin4j']).join(','))
  const tagsPerSlug = wpTags.reduce((map, tag) => {
    const { slug, id } = tag
    map[slug] = id
    return map
  }, {})
  debug('Found the corresponding tags on WordPress: %o', tagsPerSlug)
  const tagIds = tags.split(',').map(tag => tagsPerSlug[tag.trim()]).filter(wpTag => wpTag !== undefined).map(wpTag => wpTag.id)
  const wpCategories = await getCategories(categories.split(',').map(category => category.trim()).join(','))
  const categoriesPerSlug = wpCategories.reduce((map, category) => {
    const { slug, id } = category
    map[slug] = id
    return map
  }, {})
  debug('Found the corresponding categories on WordPress: %o', categoriesPerSlug)
  const wpAuthor = await findUser(authorName)
  let author = {}
  if (wpAuthor && wpAuthor.length > 0) {
    author = wpAuthor[0]
    debug('Found the corresponding author on WordPress: %o', { id: author.id, name: author.name })
  } else {
    console.warn(`Unable to find the author with name: ${authorName} in WordPress, using the default author.`)
  }

  const publishDate = getIssueDate(issueDate)
  let publishDateUTCIncludingTimeZone
  if (publishDate.isDstObserved()) {
    // UTC-7 Pacific Daylight Time (PDT)
    publishDateUTCIncludingTimeZone = `${issueDate}T07:01:00`
  } else {
    // UTC-8 Pacific Standard Time (PST) from early November to mid-March
    publishDateUTCIncludingTimeZone = `${issueDate}T08:01:00`
  }
  const blogPostData = {
    title: documentTitle,
    content: content,
    status: 'future',
    date_gmt: publishDateUTCIncludingTimeZone,
    tags: Object.values(tagsPerSlug),
    categories: Object.values(categoriesPerSlug),
    featured_media: featuredMediaId,
    author: author.id
  }
  if (result && result.length > 0) {
    const blogPostId = result[0].id
    debug(`Blog post with slug ${slug} found, updating blog post with id: ${blogPostId}.`)
    await updatePost(blogPostId, blogPostData)
  } else {
    const {content: _, ...data} = blogPostData
    debug(`Blog post with slug: ${slug} not found, creating with data: %o.`, data)
    await createPost(blogPostData)
  }
}

const args = process.argv.slice(2)
const issueDate = args[0]

if (!issueDate) {
  console.error('Issue date is undefined, please specify an issue date `npm run publish-blog-post 2021-05-15`.')
  process.exit(9)
}

;(async () => {
  try {
    console.log(`Publishing blog post for Twin4j newsletter ${issueDate}...`)
    await publish(issueDate)
  } catch (e) {
    console.error('Something wrong happened!', e)
  }
})()
