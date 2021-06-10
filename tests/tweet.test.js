'use strict'

const luxon = require('luxon')
const chai = require('chai')

const DateTime = luxon.DateTime
const expect = chai.expect
const { getTweetFile, ArgumentOutOfRangeError } = require('../tasks/lib/data.js')

describe('#getTweetFile', () => {
  it('should throw an ArgumentOutOfRangeError on Wednesday (no tweet!)', () => {
    const dateTime = DateTime.fromObject({ year: 2021, month: 6, day: 9, zone: 'America/Los_Angeles' }).setLocale('en')
    expect(() => {
      getTweetFile(dateTime)
    }).to.throw(ArgumentOutOfRangeError, 'We do not tweet on Wednesday.')
  })
  it('should throw an ArgumentOutOfRangeError on Thursday (no tweet!)', () => {
    const dateTime = DateTime.fromObject({ year: 2021, month: 6, day: 10, zone: 'America/Los_Angeles' }).setLocale('en')
    expect(() => {
      getTweetFile(dateTime)
    }).to.throw(ArgumentOutOfRangeError, 'We do not tweet on Thursday.')
  })
  it('should throw an ArgumentOutOfRangeError on Friday (no tweet!)', () => {
    const dateTime = DateTime.fromObject({ year: 2021, month: 6, day: 11, zone: 'America/Los_Angeles' }).setLocale('en')
    expect(() => {
      getTweetFile(dateTime)
    }).to.throw(ArgumentOutOfRangeError, 'We do not tweet on Friday.')
  })
  it('should return first tweet when date is in range', () => {
    // saturday 00:02:03
    const dateTime = DateTime.fromObject({ year: 2021, month: 6, day: 12, hour: 0, minute: 2, second: 3, zone: 'America/Los_Angeles' }).setLocale('en')
    const tweetFile = getTweetFile(dateTime)
    expect(tweetFile).to.equal('1-sat-00-00.txt')
  })
  it('should not return first tweet when date is (slightly) outside range', () => {
    // saturday 00:02:03
    const dateTime = DateTime.fromObject({ year: 2021, month: 6, day: 12, hour: 0, minute: 6, second: 7, zone: 'America/Los_Angeles' }).setLocale('en')
    expect(() => {
      getTweetFile(dateTime)
    }).to.throw(ArgumentOutOfRangeError, 'Tweet windows [2021-06-12T00:00:00.000-07:00, 2021-06-12T05:00:00.000-07:00, 2021-06-12T14:00:00.000-07:00, 2021-06-12T21:00:00.000-07:00] is not between 2021-06-12T00:01:07.000-07:00 and 2021-06-12T00:11:07.000-07:00.')
  })
})
