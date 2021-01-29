export default {
    definitions: {
        entity_list: {
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
                    type: 'integer'
                }

            }
        },
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
        }
    }
}