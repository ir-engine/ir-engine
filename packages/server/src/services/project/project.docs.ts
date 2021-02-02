export default {
    definitions: {
        project: {
            type: 'object',
            properties: {

            }
        },
        project_list: {
            type: 'array',
            items: { $ref: '#/definitions/project'}
        }
    }
}