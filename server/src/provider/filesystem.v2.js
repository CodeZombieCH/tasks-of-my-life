const fsp = require('fs').promises
const frontMatter = require('front-matter')
const jsYaml = require('js-yaml')
const sanitize = require('sanitize-filename')
const fg = require('fast-glob')

const fileNamePattern = new RegExp(/^(\.?)(.+?)-(\d+)\.md$/)

class FileSystemProviderV2 {
  constructor (dataDirectoryPath) {
    if (!dataDirectoryPath.endsWith('/')) dataDirectoryPath += '/'
    this.dataDirectoryPath = dataDirectoryPath
  }

  getRoot () {
    return this.getTask(0)
  }

  /**
   * Gets a path for a task file by building it using the task attributes
   * @param {object} task A task object
   */
  getPathFromTask (task) {
    const status = task.attributes.completionDate ? '.' : ''
    const sanitizedName = sanitize(task.attributes.title, { replacement: '-' })
      .replace(/\s/g, '-')
      .toLowerCase()

    return `${this.dataDirectoryPath}${status}${sanitizedName}-${task.id}.md`
  }

  /**
   * Gets a path for a task file by searching for task files with a matching task ID
   * @param {int} taskId A task ID
   */
  async getPathFromId (taskId) {
    const matchingFiles = await fg([`*-${taskId}.md`], {
      cwd: this.dataDirectoryPath,
      deep: 1,
      dot: true
    })

    if (matchingFiles.length === 0) {
      return null
    } else if (matchingFiles.length === 1) {
      return this.dataDirectoryPath + matchingFiles[0]
    } else {
      throw new Error(`Failed to uniquely identify path for task ID ${taskId}: found ${matchingFiles.length} matches`)
    }
  }

  async getTask (taskId) {
    if (!Number.isInteger(taskId)) {
      throw new Error('Task ID is not a valid integer')
    }

    const path = await this.getPathFromId(taskId)
    if (!path) {
      throw new Error(`Failed to find file for task ${taskId}`)
    }

    const data = await fsp.readFile(path, 'utf8')

    // Load front matter
    const task = frontMatter(data)

    // Enrich with task ID
    task.id = taskId

    return task
  }

  async setTask (task) {
    // TODO: Validate
    if (!Number.isInteger(task.id)) {
      throw new Error('Task ID is not a valid integer')
    }

    let fileContent = ''
    fileContent += '---\n'
    fileContent += jsYaml.safeDump(task.attributes)
    fileContent += '---\n'
    fileContent += '\n'
    fileContent += task.body

    const existingPath = await this.getPathFromId(task.id)
    const currentPath = this.getPathFromTask(task)

    // Check if there is an existing task file and if they are different
    // (meaning the task title or completionStatus has been changed)
    if (existingPath && existingPath !== currentPath) {
      // If so, we have to move the task file
      console.log(`Moving file '${existingPath}' to '${currentPath}'...`)
      await fsp.rename(existingPath, currentPath)
      console.log(`Moving file '${existingPath}' to '${currentPath}' completed successfully`)
    }

    console.log(`Writing file '${currentPath}'...`)
    await fsp.writeFile(currentPath, fileContent)
    console.log(`Writing file '${currentPath}' completed successfully`)

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
    // TODO: Validate
    if (!Number.isInteger(taskId)) {
      throw new Error('Task ID is not a valid integer')
    }

    if (taskId === 0) {
      throw new Error('Root task cannot be deleted')
    }

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
    const path = await this.getPathFromId(taskId)
    console.log(`Deleting file '${path}'...`)
    await fsp.unlink(path)
    console.log(`Deleting file '${path}' completed successfully`)
  }

  async findNextId (files) {
    if (!files) {
      files = await fsp.readdir(this.dataDirectoryPath)
    }

    // files.forEach(file => {
    //   console.log(file)
    // })

    const ids = files
      .map(f => fileNamePattern.exec(f))
      .filter(r => r != null)
      .map(r => r[3])

    const max = Math.max.apply(null, ids)

    if (Number.isNaN(max)) {
      throw new Error('findNextId() implementation broken')
    }

    console.log(`Found ${max + 1} as the next number`)
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

module.exports = FileSystemProviderV2
