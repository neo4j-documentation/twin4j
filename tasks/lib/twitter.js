'use strict'

const OAuth = require('oauth')

const twitterApplicationConsumerKey = process.env['TWITTER_APPLICATION_CONSUMER_KEY']
const twitterApplicationSecret = process.env['TWITTER_APPLICATION_SECRET']
const twitterUserAccessToken = process.env['TWITTER_USER_ACCESS_TOKEN']
const twitterUserSecret = process.env['TWITTER_USER_SECRET']

async function sendTweet(status) {
  const postBody = {
    status
  }
  const oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    twitterApplicationConsumerKey,
    twitterApplicationSecret,
    '1.0A',
    null,
    'HMAC-SHA1'
  )
  return new Promise((resolve, reject) => {
    oauth.post('https://api.twitter.com/1.1/statuses/update.json',
      twitterUserAccessToken, // oauth_token (user access token)
      twitterUserSecret, // oauth_secret (user secret)
      postBody, // post body
      '', // post content type
      function (err, data, res) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
  })
}

module.exports = {
  sendTweet
}
