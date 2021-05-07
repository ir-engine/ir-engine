/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { useTranslation } from 'react-i18next';

// @ts-ignore
import styles from './TipsAndTricks.module.scss';

export const TipsAndTricks = () => { 
    const data=[];
	const { t } = useTranslation();
    for(let i=0; i<random(10); i++){
        data.push({ 
            title: t('social:tips.title'),
            description: t('social:tips.description')
        });
    }
    return <section className={styles.tipsandtricksContainer}>
        {data.map((item, itemindex)=>
            <Card className={styles.tipItem} square={true} elevation={0} key={itemindex}>
                <CardMedia   
                    className={styles.previewImage}      
                    component='video'            
                    src={'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'}
                    title={item.title}
                    controls
                />
                <CardContent>
                    <Typography className={styles.tipsTitle}>{item.title}</Typography>
                    <Typography className={styles.tipsDescription}>{item.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>;
};

export default TipsAndTricks;