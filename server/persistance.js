const fs = require('fs')
const frontMatter = require('front-matter')
const jsYaml = require('js-yaml')

const fileNamePattern = new RegExp(/(\.?)(\d+)\.md/)

class Persistance {
  constructor (dataDirectoryPath) {
    this.dataDirectoryPath = dataDirectoryPath
  }

  getRoot () {
    return this.getTask(0)
  }

  getTask (taskId) {
    return new Promise((resolve) => {
      if (!Number.isInteger(taskId)) {
        throw new Error('Not a valid integer')
      }

      fs.readFile(`${this.dataDirectoryPath}/${taskId}.md`, 'utf8', (error, data) => {
        if (error) throw error

        // Load front matter
        const task = frontMatter(data)

        // Enrich with task ID
        task.id = taskId

        resolve(task)
      })
    })
  }

  setTask (task) {
    return new Promise((resolve) => {
      // TODO: Validate
      if (typeof task.id === 'undefined') {
        throw Error('Task ID undefined')
      }

      let fileContent = ''
      fileContent += '---\n'
      fileContent += jsYaml.safeDump(task.attributes)
      fileContent += '---\n'
      fileContent += '\n'
      fileContent += task.body

      fs.writeFile(`${this.dataDirectoryPath}/${task.id}.md`, fileContent, (error) => {
        if (error) throw error
        resolve(fileContent)
      })
    })
  }

  async createChildTask (parentTaskId, task) {
    const parentTask = await this.getTask(parentTaskId)

    if (!parentTask) {
      throw new Error(`Parent task with ID ${parentTaskId} does not exist`)
    }

    // Create new task
    const nextId = await this.findNextId()
    const newTask = {
      id: nextId,
      attributes: {
        title: task.attributes.title,
        completionDate: null,
        children: []
      },
      body: ''
    }

    // Save new task
    await this.setTask(newTask)

    // Update parent task
    if (typeof parentTask.attributes.children === 'undefined') {
      parentTask.attributes.children = []
    }
    parentTask.attributes.children.push(nextId)
    await this.setTask(parentTask)

    // We intentionally do not return the created task but only its ID
    // If the data of the newly created task is needed, it should be reloaded by caller
    return newTask.id
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
