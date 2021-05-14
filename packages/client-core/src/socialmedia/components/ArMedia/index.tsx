/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, CardMedia, Typography} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useTranslation } from 'react-i18next';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { createArMedia, getArMedia } from '../../reducers/arMedia/service';
import { selectAdMediaState } from '../../reducers/arMedia/selector';
import { updateArMediaState, updateNewFeedPageState } from '../../reducers/popupsState/service';

// @ts-ignore
import styles from './ArMedia.module.scss';

const mapStateToProps = (state: any): any => {
    return {
      creatorsState: selectCreatorsState(state),
      arMediaState: selectAdMediaState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createArMedia: bindActionCreators(createArMedia, dispatch),
    getArMedia: bindActionCreators(getArMedia, dispatch),
    updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
    updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch),
});
  interface Props{
    projects?:any[];
    view?:any;
    creatorsState?: any;
    arMediaState?: any;
    createArMedia?: typeof createArMedia; 
    getArMedia?:typeof getArMedia; 
    updateArMediaState?:typeof updateArMediaState; 
    updateNewFeedPageState?: typeof updateNewFeedPageState;
  }

const ArMedia = ({getArMedia, arMediaState, updateArMediaState, updateNewFeedPageState}:Props) => {
  const [type, setType] = useState('clip');
  const [list, setList] = useState(null);
  useEffect(()=> {getArMedia();}, []);
	const { t } = useTranslation();

  useEffect(()=> {
      if(arMediaState.get('fetching') === false){
      setList(arMediaState?.get('list').filter(item=>item.type === type));
    }
  }, [arMediaState.get('fetching'), type]);

    return <section className={styles.arMediaContainer}>
      <Button variant="text" className={styles.backButton} onClick={()=>updateArMediaState(false)}><ArrowBackIosIcon />{t('social:arMedia.back')}</Button>
      <section className={styles.switcher}>
        <Button variant={type === 'clip' ? 'contained' : 'text'} className={styles.switchButton+(type === 'clip' ? ' '+styles.active : '')} 
            onClick={()=>setType('clip')}>{t('social:arMedia.clip')}</Button>
        <Button variant={type === 'background' ? 'contained' : 'text'} className={styles.switchButton+(type === 'background' ? ' '+styles.active : '')} 
            onClick={()=>setType('background')}>{t('social:arMedia.backgrounds')}</Button>
      </section>
      <section className={styles.flexContainer}>
        {list?.map((item, itemIndex)=>
            <section className={styles.previewImageContainer}>
              <CardMedia 
              key={itemIndex}
                className={styles.previewImage}
                image={item.previewUrl}
              />
              <Typography>{item.title}</Typography>
            </section>
        )}
      </section>
      <Button className={styles.startRecirding} onClick={()=> {updateArMediaState(false); updateNewFeedPageState(true);}} variant="contained" >
          {t('social:arMedia.start')}
      </Button>
    </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ArMedia);