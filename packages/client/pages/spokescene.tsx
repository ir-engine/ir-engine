import Layout from "../components/ui/Layout";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Error404 from "./404";
import React, { useEffect } from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import gql from "graphql-tag";
import { createEntity } from "@xr3ngine/common"

const SpokeRoom = dynamic(
  () => import("../components/xr/scene/spoke-scene"),
  {
    ssr: false
  }
);
const SpokeRoomPage: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const props = {
    projectId: projectId
  };
  let world: any;
  const client: any = new ApolloClient({
    uri: "https://localhost:3030/graphql"
  });
  const ENTITY_QUERY = gql`
    {
      entity {
        id
        name
        type
        components {
          id
          type.
        }
      }
    }
  `;
  useEffect(() => {
    initialize();
    const testEntity = createEntity();
    console.log(testEntity);
    client
      .query({
        query: ENTITY_QUERY
      })
      .then(result => {
        console.log(result.data);
        if (!result.data.entities) return;
        result.data.entities.map((entity: any) => {
          createEntity();
          console.log(entity);
        });
        console.log(result.data);
      });
  }, []);
  if (!projectId) {
    return <Error404 />;
  }
  return (
    <Layout pageTitle="Home">
      <ApolloProvider client={client}>
        <Query query={ENTITY_QUERY}>
          {({ loading, error, data }: any) => {
            if (loading) return <h4> Loading... </h4>;
            if (error) return <h4> Error </h4>;
            return (
              <div>
                {data.entity.map((entity: any) => (
                  <p key={entity}>
                    {entity.name} | {createEntity().id}{" "}
                  </p>
                ))}
              </div>
            );
          }}
        </Query>
      </ApolloProvider>
    </Layout>
  );
};
export default SpokeRoomPage;
