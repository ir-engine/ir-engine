import React from 'react';
import { VolumetricPlayer } from "../components/VolumetricPlayer";
import styles from './index.module.scss';

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof document !== 'undefined'? document.baseURI + "/liam.drcs" : "";
    const videoFilePath = typeof document !== 'undefined'? document.baseURI + "/liam.mp4" : "";
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
