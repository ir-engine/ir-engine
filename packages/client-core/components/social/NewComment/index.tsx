import React from 'react';

import { TextField } from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import styles from './NewComment.module.scss';


const NewComment = () => { 
    return  <section className={styles.messageContainer}>
                <TextField name="new_comment" fullWidth placeholder="Add your comment..." />     
                <TelegramIcon className={styles.sendButton} />
            </section>
};

export default NewComment;