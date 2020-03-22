const fsp = require('fs').promises
const frontMatter = require('front-matter')
const jsYaml = require('js-yaml')

const fileNamePattern = new RegExp(/(\.?)(\d+)\.md/)

class FileSystemProviderV1 {
  constructor (dataDirectoryPath) {
    if (!dataDirectoryPath.endsWith('/')) dataDirectoryPath += '/'
    this.dataDirectoryPath = dataDirectoryPath
  }

  getRoot () {
    return this.getTask(0)
  }

  getPath (taskId) {
    return `${this.dataDirectoryPath}${taskId}.md`
  }

  async getTask (taskId) {
    if (!Number.isInteger(taskId)) {
      throw new Error('Not a valid integer')
    }

    const path = this.getPath(taskId)
    const data = await fsp.readFile(path, 'utf8')

    // Load front matter
    const task = frontMatter(data)

    // Enrich with task ID
    task.id = taskId

    return task
  }

  async setTask (task) {
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

    const path = this.getPath(task.id)
    console.log(`Writing file '${path}'...`)
    await fsp.writeFile(path, fileContent)
    console.log(`Writing file '${path}' completed successfully`)

    return fileContent
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

  async deleteTask (taskId) {
    const task = await this.getTask(taskId)

    if (!task) {
      throw new Error(`Task with ID ${taskId} does not exist`)
    }

    if (task.attributes.children.length > 0) {
      throw new Error(`Refused to delete task ${taskId} because it has children`)
    }

    const parentTask = await this.getParentTask(taskId)
    if (!parentTask) {
      console.warn(`Data inconsistency detected: orphaned task ${taskId}`)
    }

    // Remove child from parent
    const index = parentTask.attributes.children.indexOf(taskId)
    if (index === -1) {
      console.warn('Logic failure detected: child task ID is not in list of parents children')
    }
    parentTask.attributes.children.splice(index, 1)
    await this.setTask(parentTask)

    // Delete task
    const path = this.getPath(taskId)
    console.log(`Deleting file '${path}'...`)
    await fsp.unlink(path)
    console.log(`Deleting file '${path}' completed successfully`)
  }

  async findNextId () {
    const files = await fsp.readdir(this.dataDirectoryPath)

    // files.forEach(file => {
    //   console.log(file)
    // })

    const ids = files
      .map(f => fileNamePattern.exec(f))
      .filter(r => r != null)
      .map(r => r[2])

    const max = Math.max.apply(null, ids)
    return max + 1
  }

  async getParentTask (taskId, currentTaskId = 0) {
    const currentTask = await this.getTask(currentTaskId)

    // Check current
    if (currentTask.attributes.children.includes(taskId)) {
      return currentTask
    }

    // Recursively search children
    for (const childTaskId of currentTask.attributes.children) {
      const result = await this.getParentTask(taskId, childTaskId)
      if (result) {
        return result
      }
    }

    // Nothing found
    return null
  }
}

module.exports = FileSystemProviderV1
