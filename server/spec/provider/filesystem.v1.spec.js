const FileSystemProviderV1 = require('../../src/provider/filesystem.v1')

describe('The FileSystemProviderV1 v1 class', () => {
  const provider = new FileSystemProviderV1('test/temp/v1')

  it('can read the root task correctly', async () => {
    const task = await provider.getTask(0)
    expect(task).toBeDefined()
    expect(task.id).toBe(0)
  })

  it('can mark a task as completed by setting a completion date', async () => {
    // Arrange
    let task = await provider.getTask(1)

    // Act
    const completionDate = new Date().toISOString()
    task.attributes.completionDate = completionDate
    await provider.setTask(task)

    // Assert
    task = await provider.getTask(1)

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
    const newChildId = await provider.createChildTask(parentTaskId, task)

    // Assert
    // Assert child task
    expect(newChildId).toBeDefined()

    const childTask = await provider.getTask(newChildId)

    expect(childTask).toBeDefined()
    expect(childTask.id).toBe(newChildId)
    expect(childTask.attributes.completionDate).toBe(null)
    expect(childTask.attributes.children).toBeDefined()
    expect(childTask.attributes.children.length).toBe(0)

    // Assert parent task
    const actualParentTask = await provider.getTask(parentTaskId)
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
    await expectAsync(provider.createChildTask(parentTaskId, task)).toBeRejected('Not a valid integer')
  })

  it('can find the parent of a task ID', async () => {
    // Arrange
    const taskId = 10

    // Act
    const parent = await provider.getParentTask(taskId)
    expect(parent.id).toBe(2)
  })

  it('can delete a task', async () => {
    // Arrange
    const taskId = 10
    const parentTaskId = 2

    // Act
    await provider.deleteTask(taskId)

    // Assert
    // Assert parent task
    const actualParentTask = await provider.getTask(parentTaskId)
    expect(actualParentTask.attributes.children).toBeDefined()
    expect(actualParentTask.attributes.children).not.toContain(taskId)

    // Assert child task
    // await expectAsync(persistance.getTask(taskId)).toBeRejected()
  })
})
