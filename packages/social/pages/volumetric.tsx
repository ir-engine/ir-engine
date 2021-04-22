import React from 'react';
import styles from './index.module.scss';

import { VolumetricPlayer } from "../components/VolumetricPlayer";

export const IndexPage = (props: any): any => {
    const meshFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/sam_low_fuse.drcs" : "";
    const videoFilePath = typeof location !== 'undefined'? location.origin + "/volumetric/sam_low_fuse.mp4" : "";
    console.log("Mesh file path is", meshFilePath);
    return (
        <div className={styles.viewport}>
            <h1>Arc volumetric test</h1>
            <VolumetricPlayer
              meshFilePath={meshFilePath}
              videoFilePath={videoFilePath}
              cameraVerticalOffset={0.5}
            />
        </div>
    );
};
export default IndexPage;
