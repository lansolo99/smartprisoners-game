export const droppableRemoveMirror = {
  methods: {
    removeMirror() {
      const draggableMirror = document.querySelector('.draggable-mirror')
      if (draggableMirror) {
        draggableMirror.remove()
      }
    }
  },
  beforeDestroy() {
    this.removeMirror()
  }
}
