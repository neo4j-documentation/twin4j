'use strict'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function getIssueDate(issueDate) {
  const date = new Date(`${issueDate}T00:00:00Z`)
  if (!(date instanceof Date) || isNaN(date)) {
    console.error(`Issue date ${issueDate} is not a valid date, please use yyyy-MM-dd format, for instance: 2021-02-04 (February 4th, 2021).`)
    process.exit(9)
  }
  return date
}

function getMediaSlug(issueDate) {
  const date = getIssueDate(issueDate)
  const yyyy = date.getUTCFullYear()
  const month = monthNames[date.getUTCMonth()]
  const dd = ('0' + (date.getUTCDate())).slice(-2)
  return `this-week-in-neo4j-${dd}-${month}-${yyyy}`
}

module.exports = {
  getIssueDate,
  getMediaSlug
}
