<template>
  <div class="centralShapeWrapper">
    <!-- Schema1 -->
    <svg
      v-if="schema.id === 1"
      version="1.1"
      class="centralShape__back"
      x="0"
      y="0"
      viewBox="0 0 190 190"
      xml:space="preserve"
    >
      <path
        id="dropzone7"
        :class="['dropzone', { filled: schema.parts[7 - 1].isPlaced }]"
        data-dropzone="7"
        d="M33 65.2l40.9 98.1-9.2 13.8-48-111.6z"
      />

      <path
        id="dropzone15"
        :class="['dropzone', { filled: schema.parts[15 - 1].isPlaced }]"
        data-dropzone="15"
        d="M66.6 23.7H15L10.4 9.8h60.9z"
      />
      <path
        id="dropzone4"
        :class="['dropzone', { filled: schema.parts[4 - 1].isPlaced }]"
        data-dropzone="4"
        d="M139.2 51.5H32.6l-9.3-13.9h125.2z"
      />
      <path
        id="dropzone16"
        :class="['dropzone', { filled: schema.parts[16 - 1].isPlaced }]"
        data-dropzone="16"
        d="M98 19.4v51.4l-13.9 4.4V15z"
      />
      <path
        id="dropzone6"
        :class="['dropzone', { filled: schema.parts[6 - 1].isPlaced }]"
        data-dropzone="6"
        d="M176.3 9.8h-46.4l3.5 13.9H150l-29.5 71.9 9.6 11.8 34.2-83.7h8.6z"
      />
      <path
        id="dropzone14"
        :class="['dropzone', { filled: schema.parts[14 - 1].isPlaced }]"
        data-dropzone="14"
        d="M153.1 93.3h-88l6.5 13.9h53.9l-25.6 62.6 9.6 11.8 30.4-74.4h6.7z"
      />
      <path
        id="dropzone8"
        :class="['dropzone', { filled: schema.parts[8 - 1].isPlaced }]"
        data-dropzone="8"
        d="M41.9 65.5l6.9 13.9h7l32 74.4L97.9 142l-27-62.6h56.2l5.7-13.9z"
      />
    </svg>
    <!-- Schema2 -->
    <svg
      v-if="schema.id === 2"
      version="1.1"
      class="centralShape__back"
      x="0"
      y="0"
      viewBox="0 0 190 190"
      xml:space="preserve"
    >
      <path
        id="dropzone16"
        :class="['dropzone', { filled: schema.parts[16 - 1].isPlaced }]"
        data-dropzone="16"
        d="M48 89l-16.8 42-14.9-1.7 19.6-49.4z"
      />

      <path
        id="dropzone13"
        :class="['dropzone', { filled: schema.parts[13 - 1].isPlaced }]"
        data-dropzone="13"
        d="M56.9 133h78.3l6.8-14.5H50.1zM104.6 108.8H63.3l-3.6-14.5h48.4z"
      />

      <path
        id="dropzone9"
        :class="['dropzone', { filled: schema.parts[9 - 1].isPlaced }]"
        data-dropzone="9"
        d="M21.5 178.6l16.9-3.3L80.7 72.6 68.4 60.8zM108.1 94.3l-9.2 11.8 31.7 75.5 15.8 1.6z"
      />

      <path
        id="dropzone3"
        :class="['dropzone', { filled: schema.parts[3 - 1].isPlaced }]"
        data-dropzone="3"
        d="M146.9 31.4H35.5l-9.6-14.6h130.7z"
      />
      <path
        id="dropzone2"
        :class="['dropzone', { filled: schema.parts[2 - 1].isPlaced }]"
        data-dropzone="2"
        d="M89.3 7.7v33.4H64.6l4.8 14.5h19.4l.5-1.6v16.6l14.5-4.6V12.4z"
      />
      <path
        id="dropzone6"
        :class="['dropzone', { filled: schema.parts[6 - 1].isPlaced }]"
        data-dropzone="6"
        d="M170.6 130l-28.9-68.9.3-.7h-.6l-8-19-10.3 11.5 3.2 7.5H45.2l7.2 14.5h80l22.4 53.4z"
      />
    </svg>
    <!-- Schema3 -->
    <svg
      v-if="schema.id === 3"
      version="1.1"
      class="centralShape__back"
      x="0"
      y="0"
      viewBox="0 0 190 190"
      xml:space="preserve"
    >
      <path
        id="dropzone12"
        :class="['dropzone', { filled: schema.parts[12 - 1].isPlaced }]"
        data-dropzone="12"
        d="M48.6 149.9l8.6-20.9h75.1l8.8-15.3H63.5l16.9-41.1-12.9-12.4-21.3 53.5H22.4l8.8 15.3h8.9l-21.8 54.7 17.9-3.5 8.3-20.3 3 5.3h100.1l8.7-15.3z"
      />
      <path
        id="dropzone6"
        :class="['dropzone', { filled: schema.parts[6 - 1].isPlaced }]"
        data-dropzone="6"
        d="M153.5 29.5h-31l-6.3-19.8-16.1-.3 6.4 20.1h-66l8.3 15.3h62.5l9.7 30.4 13-9.5-6.7-20.9h17.8z"
      />
      <path
        id="dropzone14"
        :class="['dropzone', { filled: schema.parts[14 - 1].isPlaced }]"
        data-dropzone="14"
        d="M81.3 69.1l1-.3V20.2L67 15.9v53.2H36.5l10.2 15.2h117l10.1-15.2z"
      />

      <path
        id="dropzone10"
        :class="['dropzone', { filled: schema.parts[10 - 1].isPlaced }]"
        data-dropzone="10"
        d="M133.1 96l-10.3 11.1 33.7 75.3 16.1 1.9zM166.8 79.8l-12.5-9-13.9 26.9 14.5 5z"
      />

      <path
        id="dropzone5"
        :class="['dropzone', { filled: schema.parts[5 - 1].isPlaced }]"
        data-dropzone="5"
        d="M40.9 53.2L20.2 91.6 5.3 86.5 28.2 44z"
      />

      <path
        id="dropzone1"
        :class="['dropzone', { filled: schema.parts[1 - 1].isPlaced }]"
        data-dropzone="1"
        d="M83.4 179.3l15.3-6.4V99.2l-15.3-6.4zM159.9 111.5L146 138.3l14.6 5.1 11.9-22.9z"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'CentralShape',
  props: {
    schema: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.centralShapeWrapper {
  width: 230px;
  height: 230px;
}
.dropzone {
  fill: darken($color-granny-smith, 30%);
  transition: fill 0.1s ease-out;
  &.filled,
  &.draggable-dropzone--occupied {
    fill: $color-theme;
  }
}
</style>
