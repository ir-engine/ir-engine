/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
// import TwitterIcon from '@material-ui/icons/Twitter';
// import InstagramIcon from '@material-ui/icons/Instagram';
// import TitleIcon from '@material-ui/icons/Title';
// import SimpleModal from '../SimpleModal';
import styles from './CreatorCard.module.scss'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getCreator } from '../../reducers/creator/service'
import { updateCreatorPageState, updateCreatorFormState } from '../../reducers/popupsState/service'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { clearCreatorFeatured } from '../../reducers/feed/service'

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getCreator: bindActionCreators(getCreator, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch),
  clearCreatorFeatured: bindActionCreators(clearCreatorFeatured, dispatch)
  // followCreator: bindActionCreators(followCreator, dispatch),
  // unFollowCreator: bindActionCreators(unFollowCreator, dispatch),
  // getFollowersList: bindActionCreators(getFollowersList, dispatch),
  // getFollowingList: bindActionCreators(getFollowingList, dispatch),
})

interface Props {
  creator: any
  creatorState?: any
  popupsState?: any
  getCreator?: typeof getCreator
  updateCreatorPageState?: typeof updateCreatorPageState
  updateCreatorFormState?: typeof updateCreatorFormState
  clearCreatorFeatured?: typeof clearCreatorFeatured
  // followCreator?: typeof followCreator;
  // unFollowCreator?: typeof unFollowCreator;
  // getFollowersList?:typeof getFollowersList;
  // getFollowingList?:typeof getFollowingList;
}

const CreatorCard = ({
  creator,
  creatorState,
  updateCreatorPageState,
  clearCreatorFeatured,
  popupsState,
  updateCreatorFormState
}: Props) => {
  const isMe = creator?.id === creatorState?.get('currentCreator').id
  const { t } = useTranslation()

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

  const renderEditButton = () => (
    <Button
      variant="text"
      className={styles.moreButton}
      aria-controls="owner-menu"
      aria-haspopup="true"
      onClick={() => {
        updateCreatorFormState(true)
        clearCreatorFeatured()
      }}
    >
      <MoreHorizIcon />
    </Button>
  )

  return creator ? (
    <>
      <Card className={styles.creatorCard} elevation={0} key={creator.username} square={false}>
        {creator.background ? (
          <CardMedia className={styles.bgImage} src={creator.background} title={creator.name} />
        ) : (
          <section className={styles.bgImage} />
        )}
        <section className={styles.controls}>
          <Button variant="text" className={styles.backButton} onClick={() => updateCreatorPageState(false)}>
            <ArrowBackIosIcon />
            {t('social:creator.back')}
          </Button>
          {isMe && renderEditButton()}
        </section>
        {/*hided for now*/}
        {/* <section className={styles.countersButtons}>
                    <section className={styles.countersButtonsSub}>
                        <Button variant={'outlined'} color='primary' className={styles.followButton} onClick={()=>handleFollowersByCreator(creator.id)}>Followers</Button>
                        <Button variant={'outlined'} color='primary' className={styles.followButton} onClick={()=>handleFollowingByCreator(creator.id)}>Following</Button>
                    </section>
                </section> */}
        {creator.avatar ? (
          <CardMedia className={styles.avatarImage} image={creator.avatar} title={creator.username} />
        ) : (
          <section className={styles.avatarImage} />
        )}
        <CardContent className={styles.content}>
          <Typography className={styles.username}>@{creator.username}</Typography>
          <Typography className={styles.titleContainer}>{creator.name}</Typography>
          <Typography className={styles.tags}>{creator.tags}</Typography>
          <Typography>{creator.bio}</Typography>

          {/* {!isMe && creator.followed === false && <Button variant={'contained'} color='primary' className={styles.followButton} 
                            onClick={()=>handleFollowCreator(creator.id)}>Follow</Button>}
                    {!isMe && creator.followed === true && <Button variant={'outlined'} color='primary' className={styles.followButton} 
                        onClick={()=>handleUnFollowCreator(creator.id)}>UnFollow</Button>} */}
          {/*hided for now*/}
          {/* {renderSocials()} */}
        </CardContent>
      </Card>
    </>
  ) : (
    <></>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorCard)
