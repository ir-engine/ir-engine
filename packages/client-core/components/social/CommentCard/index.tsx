import React from 'react';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';


import styles from './CommentCard.module.scss';
import { CommentInterface } from '@xr3ngine/common/interfaces/Comment';

const CommentCard = ({id, creator, fires, text, isFired }: CommentInterface) => { 
    // const handleAddFireClick = (feedId) =>addFireToFeed(feedId, '150');
    // const handleRemoveFireClick = (feedId) =>removeFireToFeed(feedId, '150');

    return  <Card className={styles.commentItem} square={false} elevation={0} key={id}>
                <Avatar className={styles.authorAvatar} src={creator.avatar} />                                
                <CardContent className={styles.commentCard}>
                    <Typography variant="h2">
                        {creator.username}                            
                        {creator.verified && <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>}
                    </Typography> 
                    <Typography variant="h2">{text}</Typography>                    
                    <Typography variant="h2"><span className={styles.flamesCount}>{fires}</span>Flames</Typography>
                </CardContent>
                <section className={styles.fire}>
                    {isFired ? 
                        <WhatshotIcon htmlColor="#FF6201" />
                        // onClick={()=>handleRemoveFireClick(id)} /> 
                        :
                        <WhatshotIcon htmlColor="#DDDDDD" />
                        //  onClick={()=>handleAddFireClick(id)} />
                    }
                </section>
            </Card>
};

export default CommentCard;