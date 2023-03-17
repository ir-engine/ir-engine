/**
 * An object for swagger documentation configuration
 */
export default {
  definitions: {
    'static-resource': {
      type: 'object',
      properties: {
        sid: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        url: {
          type: 'string'
        },
        mimeType: {
          type: 'string'
        },
        metadata: {
          type: 'string'
        },
        LOD0_url: {
          type: 'string'
        },
        LOD0_metadata: {
          type: 'object'
        },
        LOD1_url: {
          type: 'string'
        },
        LOD1_metadata: {
          type: 'object'
        },
        LOD2_url: {
          type: 'string'
        },
        LOD2_metadata: {
          type: 'object'
        },
        LOD3_url: {
          type: 'string'
        },
        LOD3_metadata: {
          type: 'object'
        },
        LOD4_url: {
          type: 'string'
        },
        LOD4_metadata: {
          type: 'object'
        },
        LOD5_url: {
          type: 'string'
        },
        LOD5_metadata: {
          type: 'object'
        },
        LOD6_url: {
          type: 'string'
        },
        LOD6_metadata: {
          type: 'object'
        },
        LOD7_url: {
          type: 'string'
        },
        LOD7_metadata: {
          type: 'object'
        },
        LOD8_url: {
          type: 'string'
        },
        LOD8_metadata: {
          type: 'object'
        },
        LOD9_url: {
          type: 'string'
        },
        LOD9_metadata: {
          type: 'object'
        },
        LOD10_url: {
          type: 'string'
        },
        LOD10_metadata: {
          type: 'object'
        },
        LOD11_url: {
          type: 'string'
        },
        LOD11_metadata: {
          type: 'object'
        },
        LOD12_url: {
          type: 'string'
        },
        LOD12_metadata: {
          type: 'object'
        },
        LOD13_url: {
          type: 'string'
        },
        LOD13_metadata: {
          type: 'object'
        },
        LOD14_url: {
          type: 'string'
        },
        LOD14_metadata: {
          type: 'object'
        },
        LOD15_url: {
          type: 'string'
        },
        LOD15_metadata: {
          type: 'object'
        },
        LOD16_url: {
          type: 'string'
        },
        LOD16_metadata: {
          type: 'object'
        },
        LOD17_url: {
          type: 'string'
        },
        LOD17_metadata: {
          type: 'object'
        }
      }
    },
    'static-resource_list': {
      type: 'array',
      items: { $ref: '#/definitions/static-resource' }
    }
  }
}
