/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import styles from './CreatorForm.module.scss'
import AccountCircle from '@material-ui/icons/AccountCircle'
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import EditIcon from '@material-ui/icons/Edit'
import LinkIcon from '@material-ui/icons/Link'
import SubjectIcon from '@material-ui/icons/Subject'
// import TwitterIcon from '@material-ui/icons/Twitter';
// import InstagramIcon from '@material-ui/icons/Instagram';
// import TitleIcon from '@material-ui/icons/Title';

import TextField from '@material-ui/core/TextField'
import { bindActionCreators, Dispatch } from 'redux'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { updateCreator } from '../../reducers/creator/service'
import { updateCreatorFormState } from '../../reducers/popupsState/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreator: bindActionCreators(updateCreator, dispatch),
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch)
})
interface Props {
  creatorData?: any
  creatorsState?: any
  updateCreator?: typeof updateCreator
  updateCreatorFormState?: typeof updateCreatorFormState
}

const CreatorForm = ({ creatorData, creatorsState, updateCreator, updateCreatorFormState }: Props) => {
  const history = useHistory()
  const avatarRef = React.useRef<HTMLInputElement>()
  const [creator, setCreator] = useState(
    creatorData ? creatorData : creatorsState && creatorsState.get('currentCreator')
  )
  const handleUpdateUser = (e: any) => {
    e.preventDefault()
    updateCreator(creator)
  }
  const handlePickAvatar = async (file) => setCreator({ ...creator, newAvatar: file.target.files[0] })
  const { t } = useTranslation()

  const icons = {
    UserIcon: '/assets/creator-form/userpic.png',
    EmailIcon: '/assets/creator-form/at.svg',
    EditIcon: '/assets/creator-form/edit.svg',
    MailIcon: '/assets/creator-form/envelope.svg',
    ChainIcon: '/assets/creator-form/url.svg'
  }

  useEffect(() => setCreator(creatorsState.get('currentCreator')), [creatorsState.get('currentCreator')])

  return (
    <section className={styles.creatorContainer}>
      <form className={styles.form} noValidate onSubmit={(e) => handleUpdateUser(e)}>
        <nav className={styles.headerContainer}>
          {!creatorData && (
            <Button variant="text" className={styles.backButton} onClick={() => updateCreatorFormState(false)}>
              <ArrowBackIosIcon />
              {t('social:creatorForm.back')}
            </Button>
          )}
          {!creatorData && (
            <Typography variant="h2" className={styles.pageTitle}>
              {t('social:creatorForm.edit')}
            </Typography>
          )}
          <Button variant="text" type="submit" className={styles.saveButton}>
            {t('social:creatorForm.save')}
          </Button>
        </nav>
        {creator.avatar ? (
          <CardMedia className={styles.avatarImage} image={creator.avatar} title={creator.username} />
        ) : (
          <section className={styles.avatarImage} />
        )}
        <Typography
          className={styles.uploadAvatar}
          onClick={() => {
            ;(avatarRef.current as HTMLInputElement).click()
          }}
        >
          {t('social:creatorForm.changeAvatar')}
        </Typography>
        <input
          className={styles.displayNone}
          type="file"
          ref={avatarRef}
          name="newAvatar"
          onChange={handlePickAvatar}
          placeholder={t('social:creatorForm.ph-selectPreview')}
        />
        <section className={styles.content}>
          <div className={styles.formLine}>
            <img src={icons.UserIcon} className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, name: e.target.value })}
              fullWidth
              id="name"
              placeholder={t('social:creatorForm.ph-name')}
              value={creator.name}
            />
          </div>
          <div className={styles.formLine}>
            <img src={icons.EmailIcon} className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, username: e.target.value })}
              fullWidth
              id="username"
              placeholder={t('social:creatorForm.ph-username')}
              value={creator.username}
            />
          </div>
          <div className={styles.formLine}>
            <img src={icons.MailIcon} className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, email: e.target.value })}
              fullWidth
              id="email"
              placeholder={t('social:creatorForm.ph-email')}
              value={creator.email}
            />
          </div>
          <div className={styles.formLine}>
            <img src={icons.EditIcon} className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, tags: e.target.value })}
              fullWidth
              id="tags"
              placeholder={t('social:creatorForm.ph-tags')}
              value={creator.tags}
            />
          </div>
          <div className={styles.formLine}>
            <img src={icons.ChainIcon} className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, link: e.target.value })}
              fullWidth
              id="link"
              placeholder={t('social:creatorForm.ph-link')}
              value={creator.link}
            />
          </div>
          <div className={styles.formLine}>
            <SubjectIcon className={styles.fieldLabelIcon} />
            <TextField
              className={styles.textFieldContainer}
              onChange={(e) => setCreator({ ...creator, bio: e.target.value })}
              fullWidth
              multiline
              id="bio"
              placeholder={t('social:creatorForm.ph-aboutYou')}
              value={creator.bio}
            />
          </div>
          {/*hided for now*/}
          {/* <div className={styles.formLine}>
                    <TwitterIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, twitter: e.target.value})} fullWidth id="twitter" placeholder={t('social:creatorForm.ph-twitter')} value={creator.twitter} />
                </div> 
                <div className={styles.formLine}>
                    <InstagramIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, instagram: e.target.value})} fullWidth id="instagram" placeholder={t('social:creatorForm.ph-instagram')} value={creator.instagram} />
                </div> 
                <div className={styles.formLine}>
                    <TitleIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, tiktok: e.target.value})} fullWidth id="tiktok" placeholder={t('social:creatorForm.ph-tiktok')} value={creator.tiktok} />
                </div> 
                <div className={styles.formLine}>
                    <InstagramIcon className={styles.fieldLabelIcon} />
                    <TextField className={styles.textFieldContainer} onChange={(e)=>setCreator({...creator, instagram: e.target.value})} fullWidth id="instagram" placeholder={t('social:creatorForm.ph-instagram')} value={creator.instagram} />
                </div>    */}
          <br />
          {!creatorData && (
            <Button className={styles.logOutButton} variant="contained">
              Sign-Out
            </Button>
          )}
        </section>
      </form>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorForm)
