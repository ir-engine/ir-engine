/**
 * An object for swagger documentation configiration 
 * 
 * @author Kevin KIMENYI
 */

export default {
    definitions: {
        instance: {
            type: 'object',
            properties: {
                ipAddress: {
                    type: 'string'
                },
                currentUsers: {
                    type: 'string'
                }
            }
        },
        instance_list: {
            type: 'array',
            items: { $ref: '#/definitions/instance'}
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
}