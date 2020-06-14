import React, { useEffect } from 'react'
import Layout from '../../ui/Layout'
import ApolloClient from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'

// eslint-disable-next-line no-unused-vars
import { World } from 'ecsy'

const EcsyPage = () => {
  let world: any
  let client: any
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
  useEffect(() => {
    client = new ApolloClient({
      uri: 'http://localhost:3030/graphql'
    })

    world = new World()
    const testEntity = world.createEntity()
    console.log(testEntity)
    client
      .query({
        query: ENTITY_QUERY
      })
      .then((result) => {
        result.data.entities.map((entity: any) => {
          world.createEntity()
          console.log(entity)
        })
        console.log(result.data)
      })
  }, [])

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
                  <p key={entity}>
                    {entity.name} | {world.createEntity().id}{' '}
                  </p>
                ))}
              </div>
            )
          }}
        </Query>
      </Layout>
    </ApolloProvider>
  )
}

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
export default EcsyPage
