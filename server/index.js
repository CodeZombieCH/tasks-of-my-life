const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())

const Persistance = require('./persistance')
const persistance = new Persistance('../data/')

app.get('/node/:id', function (req, res) {
  var nodeId = parseInt(req.params.id)

  persistance.getNode(nodeId)
    .then((node) => {
      res.status(200)
      res.json(node)
    })
})

app.put('/node/:id/completionDate', function (req, res) {
  var nodeId = parseInt(req.params.id)

  persistance.getNode(nodeId)
    .then(node => {
      const completionDate = req.body.completionDate
      node.attributes.completionDate = completionDate
      console.log(node)
      return persistance.setNode(node)
    })
    .then(_ => {
      return persistance.getNode(nodeId)
    })
    .then(updatedNode => {
      res.status(200)
      res.json({ completionDate: updatedNode.attributes.completionDate })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
