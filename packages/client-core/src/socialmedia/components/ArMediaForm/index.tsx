/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useTranslation } from 'react-i18next';


// @ts-ignore
import styles from './ArMediaForm.module.scss';

import { selectCreatorsState } from '../../reducers/creator/selector';
import { createArMedia } from '../../reducers/arMedia/service';

const mapStateToProps = (state: any): any => {
    return {
      creatorsState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createArMedia: bindActionCreators(createArMedia, dispatch)
});
  interface Props{
    projects?:any[];
    view?:any;
    creatorsState?: any;
    createArMedia?: typeof createArMedia;   
  }
  
const ArMediaForm = ({projects, createArMedia, view}:Props) => {
  const [type, setType] = useState(null);
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState(null);
	const { t } = useTranslation();

     
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        createArMedia({type, title, collectionId});
    };

    return <section className={styles.creatorContainer}>
         <form
          className={styles.form}
          noValidate
          onSubmit={(e) => handleSubmit(e)}
        >                     
            <section className={styles.content}>
                <div className={styles.formLine}>                   
                    <TextField className={styles.textFieldContainer} value={title} onChange={(e)=>setTitle(e.target.value)} fullWidth id="title" placeholder={t('social:arMediaform.title')}  />
                </div>
                <div className={styles.formLine}>                   
                  <FormControl className={styles.formLine}>
                    <InputLabel id="demo-simple-select-label">{t('social:arMediaform.type')}</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={type}
                      onChange={(e)=>setType(e.target.value)}
                    >
                      <MenuItem value='clip'>{t('social:arMediaform.clip')}</MenuItem>
                      <MenuItem value='background'>{t('social:arMediaform.background')}</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className={styles.formLine}>
                  <FormControl className={styles.formLine}>
                    <InputLabel id="demo-simple-select-label">{t('social:arMediaform.scene')}</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={collectionId}
                      onChange={(e)=>setCollectionId(e.target.value)}
                    >
                      {projects.map(project=><MenuItem value={project.id}>{project.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <Button
                variant="contained"
                color="primary"
                type="submit"
                className={styles.submit}
                >
                {t('social:arMediaform.save')}
                </Button>   
            </section>    
        </form>        
    </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaForm);