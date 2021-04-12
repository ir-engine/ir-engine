import React from 'react';
import styles from './index.module.scss';
import NoSSR from 'react-no-ssr';
import dynamic from 'next/dynamic';

const VolumetricPlayer = dynamic<any>(() => import("../components/VolumetricPlayer").then((mod) => mod.VolumetricPlayer), { ssr: false });

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/liam.drcs" : "";
    const videoFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/liam.m3u8" : "";
    console.log("Mesh file path is", meshFilePath);
    return (
        <div className={styles.viewport}>
            <h1>Arc volumetric test</h1>
          {/* <Canvas> */}
          <NoSSR>
            <VolumetricPlayer
              meshFilePath={meshFilePath}
              videoFilePath={videoFilePath}
              cameraVerticalOffset={0.5}
            />
            </NoSSR>
          {/* </Canvas> */}
        </div>
    );
};
export default IndexPage;
