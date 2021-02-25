import React, { useState } from 'react';
import { random } from 'lodash';
import Router from "next/router";

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import styles from './Creator.module.scss';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const Creator = () => { 
    const [videoType, setVideoType] = useState('my');
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleEditClick = () =>{
        handleClose();
        Router.push('/user');
    } 
    const isMe = Router.router.query && Router.router.query.me ? true : false;

    const creatorFeeds=[];
    for(let i=0; i<random(150, 5); i++){
        creatorFeeds.push({ 
            image :'https://picsum.photos/97/139',
            viewsCount: random(150)
        })
    }

    const creator ={ 
            background :'https://picsum.photos/375/290',
            avatar :'https://picsum.photos/110/110',
            name: 'User username',
            username: '@username',  
            tags: 'Art & Design',
            bio: 'I’m glad to share my works and these amazing kit with you!'      
    }

    return <><section className={styles.creatorContainer}>
            <Card className={styles.creatorCard} elevation={0} key={creator.username} square={false} >                 
                <CardMedia   
                    className={styles.bgImage}                  
                    image={creator.background}
                    title={creator.name}
                />
                {isMe ?  
                    <section className={styles.meControls}>
                        <Button variant="text" className={styles.backButton} onClick={()=>Router.push('/')}><ArrowBackIosIcon />Back</Button>
                        <Button variant="text" className={styles.moreButton} aria-controls="owner-menu" aria-haspopup="true" onClick={handleClick}><MoreHorizIcon /></Button>
                        <Menu id="owner-menu" 
                            anchorEl={anchorEl} 
                            getContentAnchorEl={null}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            open={Boolean(anchorEl)} 
                            onClose={handleClose}>
                            <MenuItem onClick={handleEditClick}>Edit Profyle</MenuItem>
                        </Menu>
                    </section>
                    : <section className={styles.controls}>
                    <Button variant="text" className={styles.backButton} onClick={()=>Router.push('/')}><ArrowBackIosIcon />Back</Button>                    
                </section>}
                <CardMedia   
                    className={styles.avatarImage}                  
                    image={creator.avatar}
                    title={creator.username}
                />                
                <CardContent className={styles.content}>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{creator.name}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.username}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.tags}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.bio}</Typography>
                </CardContent>
            </Card>
            {isMe && <section className={styles.videosSwitcher}>
                    <Button variant={videoType === 'my' ? 'contained' : 'text'} color='secondary' className={styles.switchButton+(videoType === 'my' ? ' '+styles.active : '')} onClick={()=>setVideoType('my')}>My Videos</Button>
                    <Button variant={videoType === 'saved' ? 'contained' : 'text'} color='secondary' className={styles.switchButton+(videoType === 'saved' ? ' '+styles.active : '')} onClick={()=>setVideoType('saved')}>Saved Videos</Button>
            </section>}
            <section className={styles.feedContainer}>
                {creatorFeeds.map((item, itemIndex)=>
                    <Card className={styles.creatorItem} elevation={0} key={itemIndex}>                 
                       <CardMedia   
                            className={styles.previewImage}                  
                            image={item.image}
                        />
                        <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
                    </Card>
                )}
            </section>
        </section>
        </>
};

export default Creator;