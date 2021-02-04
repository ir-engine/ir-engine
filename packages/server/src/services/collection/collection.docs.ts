export default {
    definitions:{
        collection:{
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
                version: {
                    type: 'integer'
                },
                metadata: {
                    type: 'object',
                },
                isPublic: {
                    type: 'integer'
                },
                type: {
                    type: 'string'
                },
                thumbnailOwnedFileId: {
                    type: 'string'
                }
            }
        },
        collection_list:{
            type: 'array',
            items: { $ref: '#/definitions/collection'}
            
        }
    }
}