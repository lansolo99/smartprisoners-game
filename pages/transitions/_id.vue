<template>
  <div>
    <PuzzleVideo :context="context" />
  </div>
</template>

<script>
import PuzzleVideo from '@/components/PuzzleVideo'
export default {
  name: 'VideoTransition',
  components: {
    PuzzleVideo
  },
  data() {
    return {
      routeId: this.$route.params.id,
      context: null
    }
  },
  created() {
    this.routeId === 'end'
      ? (this.context = 'end')
      : (this.context = 'transition')
  },
  mounted() {}
}
</script>

<style lang="scss" scoped></style>
