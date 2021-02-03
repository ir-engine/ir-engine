export default {
    definitions: {
        authentication: {
            type: "object",
            properties: {
               email: {
                   type: "string"
               },
               password: {
                   type: "string"
               }
            }
        }
    },
    securities: ['create', 'remove'],
    operations: {
      find: {
        security: [
          { bearer: [] }
        ]
      }
    }
};