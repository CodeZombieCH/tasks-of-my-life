const Persistance = require('../persistance')

describe('The Persistance class', () => {
  const persistance = new Persistance('../data/')

  it('can read the root node correctly', async () => {
    const node = await persistance.getNode(0)
    expect(node).toBeDefined()
    expect(node.id).toBe(0)
  })

  it('can mark a node as completed by setting a completion date', async () => {
    // Arrange
    let node = await persistance.getNode(1)

    // Act
    const completionDate = new Date().toISOString()
    node.attributes.completionDate = completionDate
    await persistance.setNode(node)

    // Assert
    node = await persistance.getNode(1)

    expect(node).toBeDefined()
    expect(node.id).toBe(1)
    expect(node.attributes.completionDate).toBe(completionDate)
  })
})
