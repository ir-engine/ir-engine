export default {
    definitions: {
       'publish-project': {
           type: 'object',
           properties: {

           }
       },
       'publish-project_list': {
            type: 'array',
            items: { $ref: '#/definitions/publish-project'}
       }
    }
}