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
      console.log('fetch failed', err)
    }
  }
}
