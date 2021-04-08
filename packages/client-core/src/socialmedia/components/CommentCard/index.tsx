import React, { useState } from 'react';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';


import * as styles from './CommentCard.module.scss';
import { CommentInterface } from '@xr3ngine/common/interfaces/Comment';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import SimpleModal from '../SimpleModal';
import { addFireToFeedComment, getCommentFires, removeFireToFeedComment } from '../../reducers/feedComment/service';
import { selectFeedCommentsState } from '../../reducers/feedComment/selector';

const mapStateToProps = (state: any): any => {
    return {
        feedCommentsState: selectFeedCommentsState(state),
    };
  };

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    addFireToFeedComment: bindActionCreators(addFireToFeedComment, dispatch),
    removeFireToFeedComment: bindActionCreators(removeFireToFeedComment, dispatch),
    getCommentFires: bindActionCreators(getCommentFires, dispatch),
});

interface Props{
    addFireToFeedComment?: typeof addFireToFeedComment;
    removeFireToFeedComment?: typeof removeFireToFeedComment;
    comment: CommentInterface;
    getCommentFires?:typeof getCommentFires;
    feedCommentsState?:any;
}

const CommentCard = ({comment, addFireToFeedComment, removeFireToFeedComment, getCommentFires, feedCommentsState }: Props) => { 
    const {id, creator, fires, text, isFired } = comment;
    const [openFiredModal, setOpenFiredModal] = useState(false);

    const handleAddFireClick = (feedId) =>addFireToFeedComment(feedId);
    const handleRemoveFireClick = (feedId) =>removeFireToFeedComment(feedId);

    const handleGetCommentFiredUsers = (id) => {
        getCommentFires(id);
        setOpenFiredModal(true);
    }; 

    return  <><Card className={styles.commentItem} square={false} elevation={0} key={id}>
                <Avatar className={styles.authorAvatar} src={creator.avatar} />                                
                <CardContent className={styles.commentCard}>
                    <Typography variant="h2">
                        {creator.username}                            
                        {creator.verified && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                    </Typography> 
                    <Typography variant="h2">{text}</Typography>                    
                    {(fires && fires > 0 ) ? <Typography variant="h2" onClick={()=>handleGetCommentFiredUsers(id)}><span className={styles.flamesCount}>{fires}</span>Flames</Typography> : null}
                </CardContent>
                <section className={styles.fire}>
                    {isFired ? 
                        <WhatshotIcon htmlColor="#FF6201" onClick={()=>handleRemoveFireClick(id)} /> 
                        :
                        <WhatshotIcon htmlColor="#DDDDDD" onClick={()=>handleAddFireClick(id)} />
                    }
                </section>
            </Card>
        <SimpleModal type={'comment-fires'} list={feedCommentsState.get('commentFires')} open={openFiredModal} onClose={()=>setOpenFiredModal(false)} />
</>;
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentCard);