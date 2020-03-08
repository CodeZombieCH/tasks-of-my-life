const Persistance = require('../persistance')

describe('The Persistance class', () => {
  const persistance = new Persistance('test/temp')

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
    const newChildId = await persistance.createChildTask(parentTaskId, task)

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
    await expectAsync(persistance.createChildTask(parentTaskId, task)).toBeRejected('Not a valid integer')
  })

  it('can find the parent of a task ID', async () => {
    // Arrange
    const taskId = 10

    // Act
    const parent = await persistance.getParentTask(taskId)
    expect(parent.id).toBe(2)
  })

  it('can delete a task', async () => {
    // Arrange
    const taskId = 5
    const parentTaskId = 2

    // Act
    await persistance.deleteTask(taskId)

    // Assert
    // Assert parent task
    const actualParentTask = await persistance.getTask(parentTaskId)
    expect(actualParentTask.attributes.children).toBeDefined()
    expect(actualParentTask.attributes.children).not.toContain(taskId)

    // Assert child task
    // await expectAsync(persistance.getTask(taskId)).toBeRejected()
  })
})
