import React from 'react';
import styles from './index.module.scss';
import { useTranslation } from 'react-i18next';

import { VolumetricPlayer } from "../components/VolumetricPlayer";

export const IndexPage = (props: any): any => {
  const meshFilePath = typeof location !== 'undefined' ? location.origin + "/sam_low_fuse.drcs" : "";
  const videoFilePath = typeof location !== 'undefined' ? location.origin + "/sam_low_fuse.mp4" : "";
  console.log("Mesh file path is", meshFilePath);
	const { t } = useTranslation();
  return (
    <div className={styles.viewport}>
      <h1>{t('Volumetric.header')}</h1>
      <VolumetricPlayer
        meshFilePath={meshFilePath}
        videoFilePath={videoFilePath}
        cameraVerticalOffset={0.5}
      />
    </div>
  );
};
export default IndexPage;
