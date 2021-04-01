import React from 'react';
import { VolumetricPlayer } from "../components/VolumetricPlayer";
import styles from './index.module.scss';

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/liam.drcs" : "";
    const videoFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/liam.mp4" : "";
    console.log("Mesh file path is", meshFilePath);
    return (
        <div className={styles.viewport}>
            <h1>Arc volumetric test</h1>
          {/* <Canvas> */}
            <VolumetricPlayer
              meshFilePath={meshFilePath}
              videoFilePath={videoFilePath}
              cameraVerticalOffset={0.5}
            />
          {/* </Canvas> */}
        </div>
    );
};
export default IndexPage;
