<template>
  <section class="wrapper"></section>
</template>
<script>
import { killTimeOuts } from '@/utils'
export default {
  name: 'Index',
  data() {
    return {
      timeOuts: []
    }
  },
  mounted() {
    // console.log('privatesdev:', firebaseDevKeys.projectId)
    if (process.env.NODE_ENV === 'development') {
      this.$router.replace('menu')
    }

    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('deviceready', this.goToMenu, false)
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    goToMenu() {
      this.timeOuts.push(
        setTimeout(() => {
          this.$router.replace('menu')
        }, 2000)
      )
    }
  }
}
</script>
