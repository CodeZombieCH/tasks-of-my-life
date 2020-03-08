const Persistance = require('../persistance')

describe('The Persistance class', () => {
  const persistance = new Persistance('../data/')

  it('can read the root task correctly', async () => {
    const task = await persistance.getTask(0)
    expect(task).toBeDefined()
    expect(task.id).toBe(0)
  })

  it('can mark a task as completed by setting a completion date', async () => {
    // Arrange
    let task = await persistance.getTask(1)

    // Act
    const completionDate = new Date().toISOString()
    task.attributes.completionDate = completionDate
    await persistance.setTask(task)

    // Assert
    task = await persistance.getTask(1)

    expect(task).toBeDefined()
    expect(task.id).toBe(1)
    expect(task.attributes.completionDate).toBe(completionDate)
  })

  it('can create a new child task', async () => {
    // Arrange
    const parentTaskId = 1
    const task = {
      attributes: {
        title: 'new child task'
      }
    }

    // Act
    const newChildId = await persistance.createChild(parentTaskId, task)

    // Assert
    // Assert child task
    expect(newChildId).toBeDefined()

    const childTask = await persistance.getTask(newChildId)

    expect(childTask).toBeDefined()
    expect(childTask.id).toBe(newChildId)
    expect(childTask.attributes.completionDate).toBe(null)
    expect(childTask.attributes.children).toBeDefined()
    expect(childTask.attributes.children.length).toBe(0)

    // Assert parent task
    const actualParentTask = await persistance.getTask(parentTaskId)
    expect(actualParentTask.attributes.children).toBeDefined()
    expect(actualParentTask.attributes.children).toContain(newChildId)
  })

  it('cannot create a new child task if parent ID is missing', async () => {
    // Arrange
    const parentTaskId = null
    const task = {
      attributes: {
        title: 'new child task'
      }
    }

    // Act
    await expectAsync(persistance.createChild(parentTaskId, task)).toBeRejected('Not a valid integer')
  })
})
