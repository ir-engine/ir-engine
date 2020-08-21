import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/link-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from 'apollo-link-context';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const featherStoreKey: string = publicRuntimeConfig.featherStoreKey;

// HttpLink is used for queries and mutations.
const httpLink = new HttpLink({
  uri: `https://${publicRuntimeConfig.serverDomain}/graphql`
});

// WebsocketLink is used for subscriptions
const wsLink = new WebSocketLink({
  uri: `ws://${publicRuntimeConfig.serverDomain}/subscriptions`,
  options: {
    reconnect: true,
    // This seems to be the most concise way to add the authorization header to subscriptions
    connectionParams: () => ({
      Authorization: 'Bearer ' + localStorage.getItem(featherStoreKey)
    })
  }
});

// This returns the websocket link if making a subscription and the http link if making a query or mutation.
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);
// This sets the authorization header for queries and mutations.
const authLink = setContext((operation, { headers }) => {
  const key = localStorage.getItem(featherStoreKey);

  return {
    headers: {
      ...headers,
      authorization: key ? `Bearer ${key}` : ''
    }
  };
});

// Make a new Apollo client using the inmemory cache and concatenating the auth link with the main link
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from(
    [
      authLink as unknown as ApolloLink,
      link
    ]
  )
});

export default client;
