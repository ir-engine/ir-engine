export default {
    definitions: {
        party: {
            type: 'object',
            properties: {
                
            }
        },
        party_list: {
            type: 'array',
            items: { $ref: "#/definitions/party"}
        }
    }
}