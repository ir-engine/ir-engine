import React from 'react';

import CardMedia from '@material-ui/core/CardMedia';
import styles from './Splash.module.scss';

interface MediaRecord{
    screen: string;
    logo: string;
}
interface Props {
    media: MediaRecord;    
}

const Splash = ({media}: Props) => { 

return  <>
        <CardMedia   
            className={styles.fullPage}                  
                image={media.screen}
                title="ARC Splash Screen"
            />
        <CardMedia   
            className={styles.logo}                  
                image={media.logo}
                title="ARC Logo"
            />
        </>
};

export default Splash;