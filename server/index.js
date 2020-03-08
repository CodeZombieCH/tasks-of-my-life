const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())

const Persistance = require('./persistance')
const persistance = new Persistance('../data/')

app.get('/node/:id', async function (req, res) {
  try {
    var nodeId = parseInt(req.params.id)

    const node = await persistance.getNode(nodeId)
    res.status(200)
    res.json(node)
  } catch (ex) {
    console.error(ex)
  }
})

app.put('/node/:id/completionDate', async function (req, res) {
  try {
    var nodeId = parseInt(req.params.id)

    // Load node
    let node = await persistance.getNode(nodeId)

    if (!node) {
      res.status(404)
      return
    }

    // Update node
    const completionDate = req.body.completionDate
    node.attributes.completionDate = completionDate
    await persistance.setNode(node)

    // Reload update node
    node = await persistance.getNode(nodeId)

    res.status(200)
    res.json({ completionDate: node.attributes.completionDate })
  } catch (ex) {
    console.error(ex)
  }
})

app.post('/node', async function (req, res) {
  try {
    const parentNodeId = parseInt(req.query.parentNodeId)
    const node = req.body

    // Validate
    if (!Number.isInteger(parentNodeId)) {
      res.status(400)
      res.json({ error: 'Invalid/missing parentNodeId query string' })
      return
    }

    if (typeof node !== 'object') {
      res.status(400)
      res.json({ error: 'Invalid/missing request body' })
      return
    }

    // Create node
    const newChildId = await persistance.createChild(parentNodeId, node)

    // Reload update node
    const createdNode = await persistance.getNode(newChildId)

    res.status(201)
    res.json(createdNode)
  } catch (ex) {
    console.error(ex)
  }
})

app.listen(port, () => console.log(`tasks-of-my-life-server listening on port ${port}!`))
