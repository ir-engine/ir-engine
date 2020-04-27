const typeDefinitions = `
type Entity {
    _id : String
    user: String
    collection: String
}

type RootQuery {
    allEntities: [Entity]
    entities(user: String!): [Entity]
    entity(collection: String!): Entity
}

type RootMutation {
    createEntity (
        user: String
        collection: String
    ): Entity
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`

export default typeDefinitions
