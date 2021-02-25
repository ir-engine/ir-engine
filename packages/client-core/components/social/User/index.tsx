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

import styles from './User.module.scss';
import Grid from '@material-ui/core/Grid';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';
import SubjectIcon from '@material-ui/icons/Subject';

import TextField from '@material-ui/core/TextField';

const User = () => {
    const [creator, setCreator] = useState({
        background :'https://picsum.photos/375/290',
        avatar :'https://picsum.photos/110/110',
        name: 'User username',
        email: 'mail@mail.com',
        link: 'website.com',
        username: '@username',  
        tags: 'Art & Design',
        bio: 'I’m glad to share my works and these amazing kit with you!'
}); 
    const handleUpdateUser = (e) =>{
        console.log('e',e)
    }

    return <section className={styles.creatorContainer}>
         <form
          className={styles.form}
          noValidate
          onSubmit={(e) => handleUpdateUser(e)}
        >
            <nav className={styles.headerContainer}>               
                <Button variant="text" className={styles.backButton} onClick={()=>Router.push('/')}><ArrowBackIosIcon />Back</Button>
                <Typography variant="h2" className={styles.pageTitle}>Edit Profile</Typography>
                <Button variant="text" className={styles.saveButton}>Save</Button>
            </nav>  
            <CardMedia   
                className={styles.avatarImage}                  
                image={creator.avatar}
                title={creator.username}
            />   
            <Typography variant="h4" align="center" color="secondary">Change Profile Image</Typography>
            <section className={styles.content}>
                <div className={styles.formLine}>
                    <AccountCircle className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth id="name" placeholder="Your name" value={creator.name} />
                </div>
                <div className={styles.formLine}>                
                    <AlternateEmailIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth id="username" placeholder="Your Username" value={creator.username} />
                </div> 
                <div className={styles.formLine}>
                    <MailOutlineIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth id="email" placeholder="Your Email" value={creator.email} />
                </div>
                <div className={styles.formLine}>
                    <EditIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth id="tags" placeholder="Tags" value={creator.tags} />
                </div>  
                <div className={styles.formLine}>
                    <LinkIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth id="link" placeholder="Link" value={creator.link} />
                </div>  
                <div className={styles.formLine}>
                    <SubjectIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} fullWidth multiline id="bio" placeholder="More about you" value={creator.bio} />
                </div>    
                <br />
                <br />
                <br />
                <br />
                <br />
                <Button className={styles.logOutButton} variant="contained" color="primary">Sign-out</Button>
            </section>    
        </form>        
    </section>
};

export default User;