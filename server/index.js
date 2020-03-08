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

app.listen(port, () => console.log(`tasks-of-my-life-server listening on port ${port}!`))
