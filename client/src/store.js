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
}

export default new Store()
