export class Persistance {
  constructor () {
    this.baseUrl = 'http://localhost:3000/'
  }

  async getTask (taskId) {
    try {
    // Default options are marked with *
      const response = await fetch(`${this.baseUrl}tasks/${taskId}`, {
        method: 'GET',
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow'
      })

      const data = await response.json()
      return data
    } catch (ex) {
      console.error('getTask failed', ex)
    }
  }

  async updateCompletionDate (task) {
    try {
      // Default options are marked with *
      const response = await fetch(`${this.baseUrl}tasks/${task.id}/completionDate`, {
        method: 'PUT',
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ completionDate: task.attributes.completionDate })
      })

      const data = await response.json()
      return data
    } catch (ex) {
      console.error('updateCompletionDate failed', ex)
    }
  }

  async createChildTask (parentTaskId, task) {
    try {
      const url = `${this.baseUrl}tasks?` + new URLSearchParams({
        parentTaskId
      })
      console.log(url)

      const response = await fetch(url, {
        method: 'POST',
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(task)
      })

      const data = await response.json()
      return data
    } catch (ex) {
      console.error('createChildTask failed', ex)
    }
  }
}
