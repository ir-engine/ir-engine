/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { useEffect } from 'react';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
// import TwitterIcon from '@material-ui/icons/Twitter';
// import InstagramIcon from '@material-ui/icons/Instagram';
// import TitleIcon from '@material-ui/icons/Title';
// import SimpleModal from '../SimpleModal';
// @ts-ignore
import styles from './CreatorCard.module.scss';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { getCreator} from '../../reducers/creator/service';
import { updateCreatorPageState, updateCreatorFormState } from '../../reducers/popupsState/service';
import CreatorForm from '../CreatorForm';
import SharedModal from '../SharedModal';
import AppFooter from '../Footer';
import { selectPopupsState } from '../../reducers/popupsState/selector';

const mapStateToProps = (state: any): any => {
    return {
      creatorState: selectCreatorsState(state),
      popupsState: selectPopupsState(state),
    };
  };
  
  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getCreator: bindActionCreators(getCreator, dispatch),
    updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
    updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch),
    // followCreator: bindActionCreators(followCreator, dispatch),
    // unFollowCreator: bindActionCreators(unFollowCreator, dispatch),
    // getFollowersList: bindActionCreators(getFollowersList, dispatch),
    // getFollowingList: bindActionCreators(getFollowingList, dispatch),
  });

  interface Props{
    creator: any;
    creatorState?: any;
    popupsState?: any;
    getCreator?: typeof getCreator;
    updateCreatorPageState?: typeof updateCreatorPageState,
    updateCreatorFormState?: typeof updateCreatorFormState,
    // followCreator?: typeof followCreator;
    // unFollowCreator?: typeof unFollowCreator;
    // getFollowersList?:typeof getFollowersList;
    // getFollowingList?:typeof getFollowingList;
  }

const CreatorCard = ({creator,creatorState, updateCreatorPageState, popupsState, updateCreatorFormState}:Props) => { 
    const [isMe, setIsMe] = useState(creatorState && creatorState?.get('currentCreator') && creator.id === creatorState.get('currentCreator').id ? true : false);
    useEffect(()=>{
        setIsMe(creatorState && creatorState?.get('currentCreator') && creator.id === creatorState.get('currentCreator').id ? true : false);
    },[creator.id]);
    // const [openFiredModal, setOpenFiredModal] = useState(false);
    // const [creatorsType, setCreatorsType] = useState('followers');

    // const [anchorEl, setAnchorEl] = useState(null);
    // const handleClick = (event) => {
    //     setAnchorEl(event.currentTarget);
    // };
    // const handleClose = () => {
    //     setAnchorEl(null);
    // };
    // const handleEditClick = () =>{
    //     // handleClose();
    //     // history.push('/creatorEdit');
    // }; 

    // const handleFollowCreator = creatorId => followCreator(creatorId);
    // const handleUnFollowCreator = creatorId => unFollowCreator(creatorId);

    // const handleFollowersByCreator = creatorId => {
    //     getFollowersList(creatorId);
    //     setOpenFiredModal(true);
    //     setCreatorsType('followers');
    // };
    // const handleFollowingByCreator = creatorId => {
    //     getFollowingList(creatorId);
    //     setOpenFiredModal(true);
    //     setCreatorsType('following');
    // };
    // const renderSocials = () =>  <>
    //         {creator.twitter && <a target="_blank" href={'http://twitter.com/'+creator.twitter}><Typography variant="h4" component="p" align="center"><TwitterIcon />{creator.twitter}</Typography></a>}
    //         {creator.instagram && <a target="_blank" href={'http://instagram.com/'+creator.instagram}><Typography variant="h4" component="p" align="center"><InstagramIcon />{creator.instagram}</Typography></a>}
    //         {creator.tiktok && <a target="_blank" href={'http://tiktok.com/@'+creator.tiktok}><Typography variant="h4" component="p" align="center"><TitleIcon />{creator.tiktok}</Typography></a>}
    //         {creator.snap && <a target="_blank" href={'http://snap.com/'+creator.snap}><Typography variant="h4" component="p" align="center"><TwitterIcon />{creator.snap}</Typography></a>}
    //     </>;


    //common for creator form
    const handleClose = () => {
        updateCreatorFormState(false);
    };
    const renderModal = () =>
        (popupsState?.get('creatorForm') === true) ?  
            (<SharedModal 
                open={popupsState?.get('creatorForm')}
                onClose={handleClose} 
                className={styles.creatorFormPopup}
            >
                <CreatorForm />      
                <AppFooter onGoHome={handleClose}/>
            </SharedModal>) 
            : 
            <></>;

    const creatorFormState = popupsState?.get('creatorForm');
    useEffect(()=>{renderModal();}, [creatorFormState]);


    const renderEditButton = () =>isMe && 
        <Button variant="text" className={styles.moreButton} aria-controls="owner-menu" aria-haspopup="true" 
            onClick={()=>{updateCreatorFormState(true);}}><MoreHorizIcon />
        </Button>;

    useEffect(()=> {renderEditButton();}, [isMe]);

    return  creator ?  (
        <>
            <Card className={styles.creatorCard} elevation={0} key={creator.username} square={false} >
                <CardMedia   
                    className={styles.bgImage}                  
                    src={creator.background}
                    title={creator.name}
                />              
                
                <section className={styles.controls}>
                    <Button variant="text" className={styles.backButton} 
                    onClick={()=>updateCreatorPageState(false)}><ArrowBackIosIcon />Back</Button>  
                    {renderEditButton()}                        
                </section>
                {/*hided for now*/}
                {/* <section className={styles.countersButtons}>
                    <section className={styles.countersButtonsSub}>
                        <Button variant={'outlined'} color='primary' className={styles.followButton} onClick={()=>handleFollowersByCreator(creator.id)}>Followers</Button>
                        <Button variant={'outlined'} color='primary' className={styles.followButton} onClick={()=>handleFollowingByCreator(creator.id)}>Following</Button>
                    </section>
                </section> */}
                <CardMedia   
                    className={styles.avatarImage}                  
                    image={creator.avatar}
                    title={creator.username}
                />                
                <CardContent className={styles.content}>
                    <Typography className={styles.titleContainer} gutterBottom variant="h5" component="h5" align="center">{creator.name}</Typography>
                    <Typography variant="h5" component="p" align="center">{creator.username}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.tags}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.bio}</Typography>

                    {/* {!isMe && creator.followed === false && <Button variant={'contained'} color='primary' className={styles.followButton} 
                            onClick={()=>handleFollowCreator(creator.id)}>Follow</Button>}
                    {!isMe && creator.followed === true && <Button variant={'outlined'} color='primary' className={styles.followButton} 
                        onClick={()=>handleUnFollowCreator(creator.id)}>UnFollow</Button>} */}
                    {/*hided for now*/}
                    {/* {renderSocials()} */}
                </CardContent>
            </Card>
            {renderModal()}
        </>)
    : <></>;
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatorCard);
