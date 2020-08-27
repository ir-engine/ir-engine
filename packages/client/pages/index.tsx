import React from 'react';
import NoSSR from 'react-no-ssr';

import Scene from "../components/gl/scene";
import Loading from '../components/gl/loading';
import Layout from '../components/ui/Layout';
export const IndexPage = (): any => {

  const [ sceneIsVisible, setSceneVisible ] = React.useState(false);
  const scene = sceneIsVisible? (<Scene />) : null;

  const buttonStyle: React.CSSProperties = {
    "position": "absolute",
    "bottom": '5px',
    "right": '5px'
  };

  return(
    <Layout pageTitle="Home">
      <input type="button" value="scene" onClick={() => { setSceneVisible(!sceneIsVisible); }} style={ buttonStyle } />
      <NoSSR onSSR={<Loading/>}>
        {scene}
      </NoSSR>
    </Layout>
  );
};

export default IndexPage;
