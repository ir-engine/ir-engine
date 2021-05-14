/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import CardMedia from '@material-ui/core/CardMedia';
import React from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import styles from './Splash.module.scss';


interface MediaRecord{
    screen: string;
    logo: string;
}
interface Props {
    media: MediaRecord;    
}

const Splash = ({media}: Props) => { 
	const { t } = useTranslation();

return  <>
        <CardMedia   
            className={styles.fullPage}                  
                image={media.screen}
                title={t('social:splash.screen')}
            />
        <CardMedia   
            className={styles.logo}                  
                image={media.logo}
                title={t('social:splash.logo')}
            />
        </>;
};

export default Splash;