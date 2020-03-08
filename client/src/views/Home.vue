<template>
  <div>
    <ul>
      <TreeItem :taskId="0"></TreeItem>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
import TreeItem from '@/components/TreeItem.vue'

export default {
  name: 'Home',
  components: {
    TreeItem
  }
}
</script>

<style lang="scss">

body {
  font-family: 'Courier New', Courier, monospace
}

ul {
  list-style-type: none;
}

</style>
