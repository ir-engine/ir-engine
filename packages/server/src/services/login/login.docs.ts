export default {
    definitions: {
        login: {
          type: 'object',
          properties: {
            email: {
              type: 'string'
            },
            password: {
              type: 'string'
            }
          }
        },
        login_list: {
            type: 'array',
            items: { $ref: '#/definitions/login'}
          }
      }
};