<template>
  <li>
    <template v-if="loading">
      <p>Loading...</p>
    </template>

    <template v-else>
      <div v-bind:class="{ completed: completed }" v-on:click="dumpNode">
        <span>
          <input type="checkbox" v-model="completed" v-if="node.id !== 0" style="margin-right: 1em;">
        </span>
        <span><strong>{{ node.attributes.title }}</strong></span>
        <span class="meta"> #{{ node.id }}</span>
        <span class="meta"> ({{ node.attributes.children.length }})</span>
        <span class="operations"><a v-on:click="add" href="#">[+]</a></span>
      </div>
      <ul>
        <TreeItem
          v-for="(child, index) in node.attributes.children"
          :key="index"
          :nodeId="child">
        </TreeItem>
      </ul>
    </template>
  </li>
</template>

<script>

import { Persistance } from '@/persistance.js'
const persistance = new Persistance()

export default {
  name: 'TreeItem',
  props: {
    nodeId: Number
  },
  data () {
    return {
      loading: false,
      node: {}
    }
  },
  created () {
    this.loadNode()
  },
  methods: {
    loadNode () {
      console.log(`Loading node ${this.nodeId}`)

      this.loading = true
      persistance.getNode(this.nodeId)
        .then(node => {
          this.node = node
          console.log(`Loading node ${this.nodeId} completed`, this.node)
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          console.log(error)
        })
    },
    add () {
      console.log(`Creating child node for node id ${this.nodeId}`)
    },
    dumpNode () {
      console.log(this.node)
    }
  },
  computed: {
    completed: {
      get () {
        return !!this.node.attributes.completionDate
      },
      set (value) {
        if (value === true) {
          this.node.attributes.completionDate = new Date().toISOString()
        } else {
          this.node.attributes.completionDate = null
        }

        // Send updated completion date to server
        persistance.updateCompletionDate(this.node)
          .then(completionDate => console.log(completionDate))
      }
    }
  }
}
</script>

<style lang="scss">

.meta {
  color: dimgray;
}

.completed {
  text-decoration: line-through;
}

.operations {
  a {
    text-decoration: none;

    &:hover, &:active, &:focus{
        color: white;
        background: black;
    }
  }
}

</style>
