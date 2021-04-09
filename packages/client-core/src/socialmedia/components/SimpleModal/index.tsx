import React from 'react';
// @ts-ignore
import styles from './SimpleModal.module.scss';
import { Dialog, DialogTitle } from '@material-ui/core';
import CreatorAsTitle from '../CreatorAsTitle';

interface Props{
    onClose : any,
    selectedValue?: any,
    open?: boolean;
    list:any[];
    type?: string;
}
const SimpleModal = (props: Props) : any => {
    const {onClose, selectedValue, open, list, type } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const renderListTitle = () =>{
    switch (type){
      case 'feed-fires': case 'comment-fires': return (list ? list?.length : '0') + '  flames';
      case 'followers': return (list ? list?.length : '0') + ' followers';
      case 'following': return (list ? list?.length : '0') + ' following';
      default: return '';
    }
  };
    
return  <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle className={styles.dialogTitle}>{renderListTitle()}</DialogTitle>    
        {list?.length>0 ? list?.map((creator, creatorIndex)=><CreatorAsTitle creator={creator} key={creatorIndex} />) : <p>Empty list</p>}    
  </Dialog>;
};

export default (SimpleModal);