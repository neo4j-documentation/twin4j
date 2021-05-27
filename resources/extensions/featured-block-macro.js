module.exports = function (registry) {
  registry.blockMacro(function () {
    var self = this
    self.named('featured')
    self.process(function (parent, target, attrs) {
      const name = attrs.name
      const html = `<div class="imageblock image-heading">
        <div class="content">
          <img src="${target}" alt="${name} - This Week’s Featured Community Member" width="800" height="400">
        </div>
      </div>
      <p style="font-size: .8em; line-height: 1.5em;" align="center">
        <strong>${name} - This Week's Featured Community Member</strong>
      </p>`
      return self.createPassBlock(parent,html, attrs)
    })
  })
}
