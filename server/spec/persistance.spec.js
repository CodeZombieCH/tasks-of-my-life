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

  it('can create a new child node', async () => {
    // Arrange
    const parentNodeId = 1
    const node = {
      attributes: {
        title: 'new child node'
      }
    }

    // Act
    const newChildId = await persistance.createChild(parentNodeId, node)

    // Assert
    // Assert child node
    expect(newChildId).toBeDefined()

    const childNode = await persistance.getNode(newChildId)

    expect(childNode).toBeDefined()
    expect(childNode.id).toBe(newChildId)
    expect(childNode.attributes.completionDate).toBe(null)
    expect(childNode.attributes.children).toBeDefined()
    expect(childNode.attributes.children.length).toBe(0)

    // Assert parent node
    const actualParentNode = await persistance.getNode(parentNodeId)
    expect(actualParentNode.attributes.children).toBeDefined()
    expect(actualParentNode.attributes.children).toContain(newChildId)
  })

  it('cannot create a new child node if parent ID is missing', async () => {
    // Arrange
    const parentNodeId = null
    const node = {
      attributes: {
        title: 'new child node'
      }
    }

    // Act
    await expectAsync(persistance.createChild(parentNodeId, node)).toBeRejected('Not a valid integer')
  })
})
