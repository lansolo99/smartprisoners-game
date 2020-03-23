export const computeUserScore = {
  methods: {
    computeUserScore(totalTime) {
      return new Promise((resolve, reject) => {
        // Set formatted + ms computed total session time
        const totalTime = JSON.parse(JSON.stringify(this.totalTime))
        const regex = /:/gi
        const regex2 = /\./gi

        totalTime.formatted = totalTime.formatted
          .slice(0, 11)
          .replace(regex, "'")
          .replace(regex2, "'")

        totalTime.milliseconds = Math.abs(totalTime.milliseconds)

        resolve(totalTime)
      })
    }
  }
}
