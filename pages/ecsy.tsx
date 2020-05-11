import React from 'react'
import Layout from '../components/ui/Layout'
import ApolloClient from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'

// eslint-disable-next-line no-unused-vars
import { World } from 'ecsy'

const client = new ApolloClient({
  uri: 'http://localhost:3030/graphql'
})

// const ENTITY_MUTATION = gql`
//   {
//     entity(name: 'testEntity', type: 'box', components: [
//       {
//           type: networked
//       }
//     ])
//       {
//         id
//         name
//         type
//       }
//   }
// `

const ENTITY_QUERY = gql`
  {
    entity {
      id
      name
      type
      components {
        id
        type
      }
    }
  }
`

export default class EcsyPage extends React.Component {
  world: any
  componentDidMount() {
    this.world = new World()
    const testEntity = this.world.createEntity()
    console.log(testEntity)
    // Send the query
    client
      .query({
        query: ENTITY_QUERY
      })
      .then((result) => {
        result.data.entities.map((entity: any) => {
          this.world.createEntity()
          console.log(entity)
        })
        console.log(result.data)
      })
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Layout pageTitle="Home">

          <Query query={ENTITY_QUERY}>
            {({ loading, error, data }: any) => {
              if (loading) return <h4> Loading... </h4>
              if (error) return <h4> Error </h4>
              return (
                <div>
                  {data.entity.map((entity: any) => (
                    <p key={entity}>{entity.name} | { this.world.createEntity().id } </p>
                  ))}
                </div>
              )
            }}
          </Query>

        </Layout>
      </ApolloProvider>
    )
  }
}

// class Acceleration {
//   value: Number
//   constructor() {
//     this.value = 0.1
//   }
// }

// class Position {
//   x: Number
//   y: Number
//   z: Number
//   constructor() {
//     this.x = 0
//     this.y = 0
//     this.z = 0
//   }
// }
