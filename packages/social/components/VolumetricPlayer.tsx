import React, { useEffect, useRef, useState, Suspense } from 'react';

import {
  Canvas,
  useFrame,
  useThree,
  extend,
  ReactThreeFiber,
  useLoader
} from 'react-three-fiber';
import DracosisPlayer from "@xr3ngine/volumetric/src/Player";
import { DoubleSide } from "three";

interface VolumetricPlayerProps extends React.HTMLAttributes<any>{
  meshFilePath: string,
  videoFilePath: string
}

export const VolumetricPlayer = (props:VolumetricPlayerProps) => {
  const { scene, gl } = useThree();

  // const mesh: any = useRef();

  useEffect(() => {
    console.log('create new player');
    const DracosisSequence = new DracosisPlayer({
      scene,
      renderer: gl,
      meshFilePath: props.meshFilePath,
      videoFilePath: props.videoFilePath
    });

    return () => {
      // clear volumetric player
      // DracosisSequence.dispose();
    }
  }, []);

  // this is play button
  // onClick={(e) => DracosisSequence.play()}
  return null;
}