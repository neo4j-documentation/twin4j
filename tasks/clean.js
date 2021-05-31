const ospath = require('path')
const fs = require('fs').promises

const rootDirectoryPath = ospath.join(__dirname, '..')
const buildDirectoryPath = ospath.join(rootDirectoryPath, 'build')

;(async () => {
  try {
    console.log(`Removing ${buildDirectoryPath}...`)
    await fs.rm(buildDirectoryPath, {recursive: true, force: true})
  } catch (e) {
    console.error('Something wrong happened!', e)
  }
})()

