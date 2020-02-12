const Persistance = require('../persistance')

describe('The Persistance class', () => {
  const persistance = new Persistance('../data/')

  it('can read the root node correctly', async () => {
    const node = await persistance.getNode(0)
    expect(node).toBeDefined()
    expect(node.id).toBe(0)
  })
})
