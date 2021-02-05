import React from 'react';
import { VolumetricPlayer } from "../components/VolumetricPlayer";
import styles from './index.module.scss';

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof document !== 'undefined'? document.baseURI + "volumetric/liam.drcs" : "";
    const videoFilePath = typeof document !== 'undefined'? document.baseURI + "volumetric/liam.mp4" : "";
    return (
        <div className={styles.viewport}>
            <h1>Arc volumetric test</h1>
          {/* <Canvas> */}
            <VolumetricPlayer
              meshFilePath={meshFilePath}
              videoFilePath={videoFilePath}
            />
          {/* </Canvas> */}
        </div>
    );
};
export default IndexPage;
