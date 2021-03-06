const XMLHttpRequest = require('unxhr').XMLHttpRequest

module.exports = function (registry) {
  registry.blockMacro(function () {
    var self = this
    self.named('tweet')
    self.process(function (parent, target, attrs) {
      let responseText = ''
      let status = ''
      const xhr = new XMLHttpRequest()
      xhr.open('GET', `https://publish.twitter.com/oembed?url=https://twitter.com/twin4j/status/${target}`, false)
      xhr.addEventListener('load', function() {
        status = this.status
        if (status === 200) {
          responseText = this.responseText
        }
      })
      xhr.send(null)
      if (!responseText) {
        console.log(`Unable to GET https://publish.twitter.com/oembed?url=https://twitter.com/twin4j/status/${target} - status: ${status}, make sure that the tweet ${target} exists, ignoring.`)
        return self.createPassBlock(parent, '')
      }
      try {
        const html = JSON.parse(responseText)['html']
        return self.createPassBlock(parent, `<div class="content">
${html}
</div>`)
      } catch (e) {
        // unable to parse response
        console.log(`Unable to parse reponse as JSON from https://publish.twitter.com/oembed?url=https://twitter.com/twin4j/status/${target} - reponse: ${responseText}, ignoring.`, e)
        return self.createPassBlock(parent, '')
      }
    })
  })
}
