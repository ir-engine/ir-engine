// @ts-ignore
import {resolver, attributeFields, GraphQLObjectType} from 'graphql-sequelize'

entity.entityType = new GraphQLObjectType({
  name: 'Entity',
  description: 'Base entity object, add components to give functionality to an entity.',
  fields: Object.assign(attributeFields(entity))
}


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
