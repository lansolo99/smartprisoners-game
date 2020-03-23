import { EventBus } from '@/bus'
export const showDialog = {
  methods: {
    showDialog(dialog, context) {
      console.log('showDialog')
      if (context === 'puzzleTopBar') {
        EventBus.$emit('countdownPause')
        EventBus.$emit('countdownIconPause')
      }
      const status = true
      this.updateDialogDisplay({ dialog, status })
    }
  }
}
