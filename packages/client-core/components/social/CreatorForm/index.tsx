import React, { useState } from 'react';
import { connect } from 'react-redux';
import Router from "next/router";

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import styles from './CreatorForm.module.scss';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';
import SubjectIcon from '@material-ui/icons/Subject';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import TitleIcon from '@material-ui/icons/Title';

import TextField from '@material-ui/core/TextField';
import { selectCreatorsState } from '../../../redux/creator/selector';
import { updateCreator } from '../../../redux/creator/service';
import { bindActionCreators, Dispatch } from 'redux';

const mapStateToProps = (state: any): any => {
    return {
      creatorsState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
      updateCreator: bindActionCreators(updateCreator, dispatch)
});
  interface Props{
    creatorsState?: any;
    updateCreator?: typeof updateCreator;
  }
  
const CreatorForm = ({creatorsState, updateCreator}:Props) => {
    const [creator, setCreator] = useState(creatorsState && creatorsState.get('currentCreator')); 
    const handleUpdateUser = (e:any) =>{
        e.preventDefault();
        updateCreator(creator);
    }
    const handlePickAvatar = async (file) => setCreator({...creator, avatar: file.target.files[0]});

    return <section className={styles.creatorContainer}>
         <form
          className={styles.form}
          noValidate
          onSubmit={(e) => handleUpdateUser(e)}
        >
            <nav className={styles.headerContainer}>               
                <Button variant="text" className={styles.backButton} onClick={()=>Router.push('/')}><ArrowBackIosIcon />Back</Button>
                <Typography variant="h2" className={styles.pageTitle}>Edit Profile</Typography>
                <Button variant="text" type="submit" className={styles.saveButton}>Save</Button>
            </nav>  
            <CardMedia   
                className={styles.avatarImage}                  
                image={creator.avatar}
                title={creator.username}
            />
            <Typography variant="h4" align="center" color="secondary" >Change Profile Image</Typography>
            <input type="file" name="avatar" onChange={handlePickAvatar} placeholder={'Select preview'}/>
            <section className={styles.content}>
                <div className={styles.formLine}>
                    <AccountCircle className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, name: e.target.value})} fullWidth id="name" placeholder="Your name" value={creator.name} />
                </div>
                <div className={styles.formLine}>                
                    <AlternateEmailIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, username: e.target.value})} fullWidth id="username" placeholder="Your Username" value={creator.username} />
                </div> 
                <div className={styles.formLine}>
                    <MailOutlineIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, email: e.target.value})} fullWidth id="email" placeholder="Your Email" value={creator.email} />
                </div>
                <div className={styles.formLine}>
                    <EditIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, tags: e.target.value})} fullWidth id="tags" placeholder="Tags" value={creator.tags} />
                </div>  
                <div className={styles.formLine}>
                    <LinkIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, link: e.target.value})} fullWidth id="link" placeholder="Link" value={creator.link} />
                </div>  
                <div className={styles.formLine}>
                    <SubjectIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, bio: e.target.value})} fullWidth multiline id="bio" placeholder="More about you" value={creator.bio} />
                </div>    
                <div className={styles.formLine}>
                    <TwitterIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, twitter: e.target.value})} fullWidth id="twitter" placeholder="twitter" value={creator.twitter} />
                </div> 
                <div className={styles.formLine}>
                    <InstagramIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, instagram: e.target.value})} fullWidth id="instagram" placeholder="instagram" value={creator.instagram} />
                </div> 
                <div className={styles.formLine}>
                    <TitleIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, tiktok: e.target.value})} fullWidth id="tiktok" placeholder="tiktok" value={creator.tiktok} />
                </div> 
                <div className={styles.formLine}>
                    <InstagramIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, instagram: e.target.value})} fullWidth id="instagram" placeholder="instagram" value={creator.instagram} />
                </div>   
                <br />
                <Button className={styles.logOutButton} variant="contained" color="primary">Sign-out</Button>
            </section>    
        </form>        
    </section>
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatorForm);