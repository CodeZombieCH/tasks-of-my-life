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
      task = await persistance.getNode(taskId)

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
}

export default new Store()
