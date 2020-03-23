export const noNetwork = {
  methods: {
    setNoNetworkDialog(context, action) {
      // Set offlineContext
      const update = {
        offlineContext: action
      }
      this.updateUserSession(update)
      this.showDialog('noNetwork', context)
      console.log('setNoNetworkDialog, context : ', context)
    }
  }
}
