/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */
export default {
    definitions: {
        'user-settings': {
            type: 'object',
            properties: {
                microphone: {
                    type: 'integer',
                    default: 50
                },
                audio: {
                    type: 'integer',
                    default: 50
                },
                spatialAudioEnabled: {
                    type: 'string',
                    default: true
                }
            }
        },
        'user-settings_list': {
            type: 'array',
            items: { $ref: '#/definitions/user-settings'}
        }
    },
    securities: ['create', 'update', 'patch', 'remove'],
    operations: {
      find: {
        security: [
          { bearer: [] }
        ]
      }
    } 
};