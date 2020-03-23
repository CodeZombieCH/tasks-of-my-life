<template>
  <li>
    <template v-if="loading">
      <p>Loading task #{{ task.id }}...</p>
    </template>

    <template v-else>
      <div v-bind:class="{ completed: completed }" v-on:click="dumpTask">
        <span>
          <input type="checkbox" v-model="completed" v-if="task.id !== 0" style="margin-right: 1em;">
        </span>
        <span><strong>{{ task.attributes.title }}</strong></span>
        <span class="meta">&nbsp;#{{ task.id }}</span>
        <span class="meta">&nbsp;({{ task.attributes.children.length }})</span>
        <span class="operations">
          &nbsp;
          <a v-on:click.prevent="add" href="#">[+]</a>
          <a v-on:click.prevent="deleteTask" v-if="task.attributes.children.length === 0" href="#">[-]</a>
        </span>
      </div>
      <ul>
        <TreeItem
          v-for="(childTaskId) in task.attributes.children"
          :key="childTaskId"
          :taskId="childTaskId">
        </TreeItem>
      </ul>
    </template>
  </li>
</template>

<script>

export default {
  name: 'TreeItem',
  props: {
    taskId: Number
  },
  data () {
    return {
      loading: false,
      task: {}
    }
  },
  created () {
    this.loadTask()
  },
  methods: {
    async loadTask () {
      console.log(`Loading task ${this.taskId}...`)

      this.loading = true
      try {
        const task = await this.$store.getTaskById(this.taskId)
        this.task = task
        console.log(`Loading task ${this.taskId} completed`, this.task)
        this.loading = false
      } catch (ex) {
        this.loading = false
        console.log(ex)
      }
    },
    async add () {
      console.log(`Creating child task for task ID ${this.taskId}`)
      const name = window.prompt('Name')
      if (name === null) return
      await this.$store.addTask(this.taskId, name)
    },
    async deleteTask () {
      console.log(`Deleting task with task ID ${this.taskId}`)
      if (!window.confirm(`Do you really want to delete task ${this.task.attributes.title} #${this.taskId}?`)) {
        return
      }
      await this.$store.deleteTask(this.taskId)
    },
    dumpTask () {
      console.log(this.task)
    }
  },
  computed: {
    completed: {
      get () {
        return !!this.task.attributes.completionDate
      },
      async set (value) {
        let completionDate
        if (value === true) {
          completionDate = new Date().toISOString()
        } else {
          completionDate = null
        }

        console.log(`Set completion date to ${completionDate}`, this.task)

        // Send updated completion date to server
        await this.$store.setTaskCompletionDate(this.task, completionDate)
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
    color: dimgray;
    text-decoration: none;

    &:hover, &:active {
        color: white;
        background: dimgray;
    }
  }
}

</style>
