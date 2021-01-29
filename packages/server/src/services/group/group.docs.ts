export default {
    definitions: {
        group_list: {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                }
            }
        },
        group: {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                }
            }
        }

    }
}