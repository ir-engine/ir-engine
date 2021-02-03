export default {
    definitions: {
        'a-i': {
            type: "object",
            properties: {

            }
        },
        "a-i_list": {
            type: "array",
            items: { $ref: "#/definitions/a-i"}
        }
    }
};