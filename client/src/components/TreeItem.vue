<template>
  <li>
    <template v-if="loading">
      <p>Loading...</p>
    </template>

    <template v-else>
      <div>
        <span><strong>{{ node.attributes.title }}</strong></span>
        <span class="meta"> #{{ node.id }}</span>
        <span class="meta"> ({{ node.attributes.children.length }})</span>
        <span class="operations">[<a v-on:click="add" href="#">+</a>]</span>
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
          this.loading = false
          this.node = node
          console.log(`Loading node ${this.nodeId} completed`)
        })
        .catch(error => {
          this.loading = false
          console.log(error)
        })
    },
    add () {
      console.log(`Creating child node for node id ${this.nodeId}`)
    }
  }
}
</script>

<style scoped lang="scss">

.meta {
  color: dimgray;
}

</style>
