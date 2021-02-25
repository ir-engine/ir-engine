import React from 'react';

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';


import styles from './CommentCard.module.scss';
interface CreatorShort{
    id: string,
    avatar :string,
    username: string,
}
interface Comment{
    id: number,
    author:CreatorShort,
    flamesCount: number,
    text: string
}

const CommentCard = ({id, author, flamesCount, text }: Comment) => { 
    return  <Card className={styles.commentItem} square={false} elevation={0} key={id}>
                <Avatar className={styles.authorAvatar} src={author.avatar} />                                
                <CardContent className={styles.commentCard}>
                    <Typography variant="h2">
                        {author.username}                            
                        <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>
                    </Typography> 
                    <Typography variant="h2">{text}</Typography>                    
                    <Typography variant="h2"><span className={styles.flamesCount}>{flamesCount}</span>Flames</Typography>
                </CardContent>
                <section className={styles.fire}><WhatshotIcon htmlColor="#FF6201" /></section>
            </Card>
};

export default CommentCard;