import sourceData from '@/store/datas/dialogs'

export const state = () => ({
  ...sourceData
})

export const getters = {
  showDialogWrapper(state) {
    return Object.values(state).some(v => {
      return v === true
    })
  }
}

export const mutations = {
  updateDialogDisplay(state, { dialog, status }) {
    state[`${dialog}`] = status
  },
  reset(state) {
    Object.assign(state, sourceData)
  }
}
