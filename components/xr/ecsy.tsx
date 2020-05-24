import { useEffect } from 'react'
import Layout from '../ui/Layout'
import ApolloClient from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'
import { World } from 'ecsy'

const client = new ApolloClient({
  uri: 'http://localhost:3030/graphql'
})

const ENTITY_QUERY = gql`
  {
    entity {
      name
      component
      entity_type
    }
  }
`

export const EcsyPage = () => {
  let world: any

  useEffect(() => {
    world = new World()
    // const testEntity = world.createEntity()
    // console.log(entityArray)
    // console.log(testEntity)
    init()
  }, [])

  const init = () => {
    client
      .query({
        query: ENTITY_QUERY
      })
      .then((result) => {
        console.log(result.data)
      })
  }

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
