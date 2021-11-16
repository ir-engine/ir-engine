export default {
  definitions: {
    creator: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        presetName: {
          type: 'string'
        }
      }
    },
    preset_list: {
      type: 'array',
      items: { $ref: '#/definitions/preset' }
    }
  }
}
