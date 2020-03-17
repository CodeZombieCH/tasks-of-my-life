import { Persistance } from './persistance'
const persistance = new Persistance()

class Store {
  constructor () {
    this.tasks = new Map()
  }

  async getTaskById (taskId) {
    console.log('getTaskById', taskId)

    let task = this.tasks.get(taskId)

    if (typeof task === 'undefined') {
      // Load from server
      task = await persistance.getTask(taskId)

      console.log('Loaded task from server', task)

      this.tasks.set(task.id, task)
    }

    return task
  }

  async setTaskCompletionDate (task, completionDate) {
    task.attributes.completionDate = completionDate

    // Send updated completion date to server
    await persistance.updateCompletionDate(task)
  }

  async addTask (parentTaskId, name) {
    const parentTask = await this.getTaskById(parentTaskId)

    if (!parentTask) {
      throw new Error(`Parent with ID ${parentTaskId} does not exist`)
    }

    let newTask = {
      id: this.nextDraftId--,
      attributes: {
        title: name,
        children: [],
        completionDate: null
      }
    }

    // Send to server
    newTask = await persistance.createChildTask(parentTaskId, newTask)

    // Add to store
    this.tasks.set(newTask.id, newTask)

    // Update parent task
    parentTask.attributes.children.push(newTask.id)

    return newTask
  }

  async deleteTask (taskId) {
    // Send to server
    await persistance.deleteTask(taskId)

    // Find parent
    const parentTask = await this.getParentTask(taskId)

    if (!parentTask) {
      throw new Error(`No parent found for task #${taskId}`)
    }

    // Remove child from parent
    const index = parentTask.attributes.children.indexOf(taskId)
    if (index === -1) {
      console.warn('Logic failure detected: child task ID is not in list of parents children')
    }
    parentTask.attributes.children.splice(index, 1)

    // Delete task
    if (!this.tasks.delete(taskId)) {
      console.warn(`Data inconsistency: Store was note aware of task ${taskId}`)
    }
  }

  async getParentTask (taskId, currentTaskId = 0) {
    const currentTask = await this.getTaskById(currentTaskId)

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

export default new Store()
