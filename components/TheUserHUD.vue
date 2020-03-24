<template>
  <div class="userGui">Connected as {{ user }}</div>
</template>

<script>
export default {
  name: 'TheUserHUD',
  props: {
    user: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.userGui {
  font-size: 14px;
  color: $color-red;
}
</style>
