export default {
    definitions: {
        entity: {
            type: 'object',
            properties: {
                entityId: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                },
                parent: {
                    type: 'string'
                },
                index: {
                    type: 'integer'
                },
                collectionId: {
                    type: 'string'
                }

            }
        },
        entity_list: {
            type: 'array',
            items: { $ref: '#/definitions/entity'}
        }
    }
};