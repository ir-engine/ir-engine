import React from 'react';
// @ts-ignore
import styles from './index.module.scss';
import NoSSR from 'react-no-ssr';
import dynamic from 'next/dynamic';

const VolumetricPlayer = dynamic<any>(() => import("../components/VolumetricPlayer").then((mod) => mod.VolumetricPlayer), { ssr: false });

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/sam_low_fuse.drcs" : "";
    const videoFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/sam_low_fuse.mp4" : "";
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
