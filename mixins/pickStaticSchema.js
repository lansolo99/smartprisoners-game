import Vue from 'vue'
import { mapMutations } from 'vuex'
import { getRandomIntInclusive } from '@/utils'
export const pickStaticSchema = {
  methods: {
    ...mapMutations({
      recordCurrentSchemaId: 'session/recordCurrentSchemaId'
    }),
    pickStaticSchema(puzzleId, previousSchemaUsed, data) {
      // Get number of static schemas
      const schemasLength = Object.keys(data).length
      let schemaId = 1

      // Set schema according to previous schema
      if (previousSchemaUsed === null) {
        // Set random id
        schemaId = getRandomIntInclusive(1, schemasLength)
      } else {
        // Set a cycled schema id
        schemaId = (previousSchemaUsed % schemasLength) + 1
      }

      console.log(`staticschemaId: ${schemaId}`)

      // Store schema id
      this.recordCurrentSchemaId({ puzzleId, schemaId })
      const puzzleWithFlattenData = [6, 8]
      if (puzzleWithFlattenData.includes(puzzleId)) {
        this.schema = JSON.parse(
          JSON.stringify(data[`schema${schemaId}`])
        ).flat()
      } else {
        this.schema = JSON.parse(JSON.stringify(data[`schema${schemaId}`]))
      }
      // Set schema
      Vue.set(this.schema, 'id', schemaId)
      console.log({ schemaId })
    }
  }
}
