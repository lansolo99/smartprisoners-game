export const hideDialog = {
  methods: {
    hideDialog(dialog, context) {
      const status = false
      this.updateDialogDisplay({ dialog, status })
    }
  }
}
