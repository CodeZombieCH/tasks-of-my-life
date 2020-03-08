<template>
  <li>
    <template v-if="loading">
      <p>Loading node #{{ node.id }}...</p>
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

import store from '../store'

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
    async loadNode () {
      console.log(`Loading node ${this.nodeId}...`)

      this.loading = true
      try {
        const node = await store.getTaskById(this.nodeId)
        this.node = node
        console.log(`Loading node ${this.nodeId} completed`, this.node)
        this.loading = false
      } catch (ex) {
        this.loading = false
        console.log(ex)
      }
    },
    async add () {
      console.log(`Creating child node for node id ${this.nodeId}`)
      const name = window.prompt('Name')
      await store.addTask(this.nodeId, name)
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
      async set (value) {
        let completionDate
        if (value === true) {
          completionDate = new Date().toISOString()
        } else {
          completionDate = null
        }

        console.log(`Set completion date to ${completionDate}`, this.node)

        // Send updated completion date to server
        await store.setTaskCompletionDate(this.node, completionDate)
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
