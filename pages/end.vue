<template>
  <div>
    <ScreenStorytelling context="end" />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import ScreenStorytelling from '@/components/ScreenStorytelling'
export default {
  name: 'End',
  components: {
    ScreenStorytelling
  },
  mounted() {
    // Mock user pseudo in vuex ...
    if (process.env.NODE_ENV === 'development') {
      const update = {
        pseudo: 'LEMMINGS'
      }
      this.updateUserSession(update)
    }
  },
  methods: {
    ...mapMutations({
      updateUserSession: 'session/updateUserSession'
    })
  }
}
</script>
