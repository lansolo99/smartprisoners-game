import { EventBus } from '@/bus'

export const validPuzzle = {
  methods: {
    validPuzzle() {
      if (this.checkPuzzle()) {
        this.$refs.puzzleSuccess.playSound()
        EventBus.$emit('puzzleSuccess')
      } else {
        this.$refs.bigLifeIcon.animateBigLifeIcon()
        const event = 'noMatch'
        EventBus.$emit('consumeOneLife', event)
      }
    }
  }
}

export const shakePuzzle = {
  data() {
    return {
      timeline: {}
    }
  }
}
