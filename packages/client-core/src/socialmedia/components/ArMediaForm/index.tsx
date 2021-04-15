/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Router from "next/router";

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

// @ts-ignore
import styles from './ArMediaForm.module.scss';

import TextField from '@material-ui/core/TextField';
import { bindActionCreators, Dispatch } from 'redux';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { updateCreator } from '../../reducers/creator/service';

const mapStateToProps = (state: any): any => {
    return {
      creatorsState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
      updateCreator: bindActionCreators(updateCreator, dispatch)
});
  interface Props{
    creatorData?:any;
    creatorsState?: any;
    updateCreator?: typeof updateCreator;   
  }
  
const ArMediaForm = ({creatorData, creatorsState, updateCreator}:Props) => {
     
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        // updateCreator(creator);
    };

    return <section className={styles.creatorContainer}>
         <form
          className={styles.form}
          noValidate
          onSubmit={(e) => handleSubmit(e)}
        >                     
            <section className={styles.content}>
                <div className={styles.formLine}>                   
                    <TextField className={styles.textFieldContainer} fullWidth id="title" placeholder="Title"  />
                </div>
                <Button
                variant="contained"
                color="primary"
                type="submit"
                className={styles.submit}
                >
                Save
                </Button>   
            </section>    
        </form>        
    </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaForm);