const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())

const Persistance = require('./persistance')
const persistance = new Persistance('../data/')

app.get('/tasks/:id', async function (req, res) {
  try {
    var taskId = parseInt(req.params.id)

    const task = await persistance.getTask(taskId)
    res.status(200)
    res.json(task)
  } catch (ex) {
    console.error(ex)
  }
})

app.put('/tasks/:id/completionDate', async function (req, res) {
  try {
    var taskId = parseInt(req.params.id)

    // Load task
    let task = await persistance.getTask(taskId)

    if (!task) {
      res.status(404)
      return
    }

    // Update task
    const completionDate = req.body.completionDate
    task.attributes.completionDate = completionDate
    await persistance.setTask(task)

    // Reload update task
    task = await persistance.getTask(taskId)

    res.status(200)
    res.json({ completionDate: task.attributes.completionDate })
  } catch (ex) {
    console.error(ex)
  }
})

app.post('/tasks', async function (req, res) {
  try {
    const parentTaskId = parseInt(req.query.parentTaskId)
    const task = req.body

    // Validate
    if (!Number.isInteger(parentTaskId)) {
      res.status(400)
      res.json({ error: 'Invalid/missing parentTaskId query string' })
      return
    }

    if (typeof task !== 'object') {
      res.status(400)
      res.json({ error: 'Invalid/missing request body' })
      return
    }

    // Create task
    const newChildId = await persistance.createChildTask(parentTaskId, task)

    // Reload created task
    const createdTask = await persistance.getTask(newChildId)

    res.status(201)
    res.json(createdTask)
  } catch (ex) {
    console.error(ex)
  }
})

app.listen(port, () => console.log(`tasks-of-my-life-server listening on port ${port}!`))
