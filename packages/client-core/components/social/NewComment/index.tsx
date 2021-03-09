import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { TextField } from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import { addCommentToFeed } from '../../../redux/feedComment/service';

import styles from './NewComment.module.scss';


const mapDispatchToProps = (dispatch: Dispatch): any => ({
    addCommentToFeed: bindActionCreators(addCommentToFeed, dispatch),
});

interface Props{
    addCommentToFeed?: typeof addCommentToFeed;
    feedId: any;
}

const NewComment = ({addCommentToFeed, feedId}:Props) => { 
    const [composingComment, setComposingComment] = useState('');
    const commentRef = React.useRef<HTMLInputElement>();

    const handleComposingCommentChange = (event: any): void => {
        setComposingComment(event.target.value);
    };
    const handleAddComment = () => {
        composingComment.trim().length > 0 && addCommentToFeed(feedId, '75', composingComment);
        setComposingComment('');
    }
    return  <section className={styles.messageContainer}>
                <TextField ref={commentRef} 
                    value={composingComment}
                    onChange={handleComposingCommentChange}
                    fullWidth 
                    placeholder="Add your comment..."                     
                    />     
                <TelegramIcon className={styles.sendButton} onClick={()=>handleAddComment()} />
            </section>
};

export default connect(null, mapDispatchToProps)(NewComment);