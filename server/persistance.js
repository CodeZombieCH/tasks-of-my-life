const fs = require('fs')
const frontMatter = require('front-matter')
const jsYaml = require('js-yaml')

const fileNamePattern = new RegExp(/(\.?)(\d+)\.md/)

class Persistance {
  constructor (dataDirectoryPath) {
    this.dataDirectoryPath = dataDirectoryPath
  }

  getRoot () {
    return this.getNode(0)
  }

  getNode (nodeId) {
    return new Promise((resolve) => {
      if (!Number.isInteger(nodeId)) {
        throw new Error('Not a valid integer')
      }

      fs.readFile(`${this.dataDirectoryPath}/${nodeId}.md`, 'utf8', (error, data) => {
        if (error) throw error

        // Load front matter
        const content = frontMatter(data)
        content.id = nodeId
        resolve(content)
      })
    })
  }

  setNode (node) {
    return new Promise((resolve) => {
      // TODO: Validate
      if (typeof node.id === 'undefined') {
        throw Error('Node ID undefined')
      }

      let fileContent = ''
      fileContent += '---\n'
      fileContent += jsYaml.safeDump(node.attributes)
      fileContent += '---\n'
      fileContent += '\n'
      fileContent += node.body

      fs.writeFile(`${this.dataDirectoryPath}/${node.id}.md`, fileContent, (error) => {
        if (error) throw error
        resolve(fileContent)
      })
    })
  }

  async createChild (parentNodeId) {
    const parentNode = await this.getNode(parentNodeId)

    // Create new child node
    const nextId = await this.findNextId()
    const newNode = {
      id: nextId,
      attributes: {
        title: 'New node',
        children: []
      },
      body: ''
    }

    // Save new node
    await this.setNode(newNode)

    // Update parent node
    if (typeof parentNode.attributes.children === 'undefined') {
      parentNode.attributes.children = []
    }
    parentNode.attributes.children.push(nextId)
    await this.setNode(parentNode)
  }

  findNextId () {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dataDirectoryPath, (error, files) => {
        if (error) throw error

        // files.forEach(file => {
        //   console.log(file)
        // })

        const ids = files
          .map(f => fileNamePattern.exec(f))
          .filter(r => r != null)
          .map(r => r[2])

        const max = Math.max.apply(null, ids)
        resolve(max + 1)
      })
    })
  }
}

module.exports = Persistance
