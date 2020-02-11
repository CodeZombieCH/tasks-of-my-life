const fs = require('fs')
const fm = require('front-matter')

class Persistance {
  constructor (dataDirectoryPath) {
    this.dataDirectoryPath = dataDirectoryPath
  }

  getRoot () {
    return this.getNode(0)
  }

  getNode (nodeId) {
    return new Promise((resolve, reject) => {
      if (!Number.isInteger(nodeId)) {
        throw new Error('Not a valid integer')
      }

      fs.readFile(`${this.dataDirectoryPath}/${nodeId}.md`, 'utf8', (error, data) => {
        if (error) throw error

        // Load front matter
        const content = fm(data)
        resolve(content)
      })
    })
  }
}

module.exports = Persistance
