export class Persistance {
  constructor () {
    this.baseUrl = 'http://localhost:3000/'
  }

  async getNode (nodeId) {
    try {
    // Default options are marked with *
      const response = await fetch(`${this.baseUrl}node/${nodeId}`, {
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
    } catch (err) {
      console.log('getNode failed', err)
    }
  }

  async updateCompletionDate (node) {
    try {
      // Default options are marked with *
      const response = await fetch(`${this.baseUrl}node/${node.id}/completionDate`, {
        method: 'PUT',
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ completionDate: node.attributes.completionDate })
      })

      const data = await response.json()
      return data
    } catch (err) {
      console.log('updateCompletionDate failed', err)
    }
  }

  async createChild (parentNodeId, node) {
    try {
      const url = `${this.baseUrl}node?` + new URLSearchParams({
        parentNodeId
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
        body: JSON.stringify(node)
      })

      const data = await response.json()
      return data
    } catch (err) {
      console.log('createNode failed', err)
    }
  }
}
