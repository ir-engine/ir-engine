import React, { useState } from 'react';
import { random } from 'lodash';
import Router from "next/router";

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import styles from './Creator.module.scss';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { selectCreatorsState } from '../../../redux/creator/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { getCreator } from '../../../redux/creator/service';
import Featured from '../Featured';

const mapStateToProps = (state: any): any => {
    return {
      creatorState: selectCreatorsState(state),
    };
  };
  
  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getCreator: bindActionCreators(getCreator, dispatch),
  });

  interface Props{
    creatorId: string;
    creatorState?: any;
    getCreator?: typeof getCreator;
  }

const Creator = ({creatorId, creatorState, getCreator}:Props) => { 
    const [isMe, setIsMe] = useState(false);
    let creator = null;
    useEffect(()=>{
        if(creatorState && creatorState.get('currentCreator') && creatorId === creatorState.get('currentCreator').id){
            setIsMe(true);
        }else{
            getCreator(creatorId);
        }
    },[])

    creator = creatorState && isMe === true? creatorState.get('currentCreator') : creatorState.get('creator');
    const [videoType, setVideoType] = useState('creator');
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

    const creatorFeeds=[];
    for(let i=0; i<random(150, 5); i++){
        creatorFeeds.push({ 
            image :'https://picsum.photos/97/139',
            viewsCount: random(150)
        })
    }

    return  creator ?  (<section className={styles.creatorContainer}>
            <Card className={styles.creatorCard} elevation={0} key={creator.username} square={false} >
                {creator.avatarId && creator.avatar && <CardMedia   
                    className={styles.bgImage}                  
                    image={creator.background}
                    title={creator.name}
                />}
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
                </section> }
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
                    <Button variant={videoType === 'creator' ? 'contained' : 'text'} color='secondary' className={styles.switchButton+(videoType === 'creator' ? ' '+styles.active : '')} onClick={()=>setVideoType('creator')}>My Videos</Button>
                    <Button variant={videoType === 'bookmark' ? 'contained' : 'text'} color='secondary' className={styles.switchButton+(videoType === 'bookmark' ? ' '+styles.active : '')} onClick={()=>setVideoType('bookmark')}>Saved Videos</Button>
            </section>}
            <section className={styles.feedsWrapper}><Featured creatorId={creatorId} type={videoType}/></section>
        </section>) 
    : <></>
};

export default connect(mapStateToProps, mapDispatchToProps)(Creator);