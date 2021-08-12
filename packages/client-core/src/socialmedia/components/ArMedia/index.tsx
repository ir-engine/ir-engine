/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { Button, CardMedia, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { createArMedia, getArMedia } from '../../reducers/arMedia/service'
import { selectArMediaState } from '../../reducers/arMedia/selector'
import { updateArMediaState, updateWebXRState } from '../../reducers/popupsState/service'
// import {  Plugins } from '@capacitor/core';
import Preloader from '@xrengine/client-core/src/socialmedia/components/Preloader'

import styles from './ArMedia.module.scss'

// const {XRPlugin} = Plugins;
import { XRPlugin } from 'webxr-native'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state),
    arMediaState: selectArMediaState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createArMedia: bindActionCreators(createArMedia, dispatch),
  getArMedia: bindActionCreators(getArMedia, dispatch),
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
  updateWebXRState: bindActionCreators(updateWebXRState, dispatch)
})
interface Props {
  projects?: any[]
  view?: any
  creatorsState?: any
  arMediaState?: any
  createArMedia?: typeof createArMedia
  getArMedia?: typeof getArMedia
  updateArMediaState?: typeof updateArMediaState
  updateWebXRState?: typeof updateWebXRState
}

const ArMedia = ({ getArMedia, arMediaState, updateArMediaState, updateWebXRState }: Props) => {
  const [type, setType] = useState('clip')
  const [list, setList] = useState(null)
  const [preloading, setPreloading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  useEffect(() => {
    getArMedia()
  }, [])
  const { t } = useTranslation()

  useEffect(() => {
    if (arMediaState.get('fetching') === false) {
      setList(arMediaState?.get('list').filter((item) => item.type === type))
    }
  }, [arMediaState.get('fetching'), type])

  return (
    <section className={styles.arMediaContainer}>
      {preloading && <Preloader text={'Loading...'} />}
      <Button variant="text" className={styles.backButton} onClick={() => updateArMediaState(false)}>
        <ArrowBackIosIcon />
        {t('social:arMedia.back')}
      </Button>
      <section className={styles.switcher}>
        <Button
          variant={type === 'clip' ? 'contained' : 'text'}
          className={styles.switchButton + (type === 'clip' ? ' ' + styles.active : '')}
          onClick={() => setType('clip')}
        >
          {t('social:arMedia.clip')}
        </Button>
        <Button
          variant={type === 'background' ? 'contained' : 'text'}
          className={styles.switchButton + (type === 'background' ? ' ' + styles.active : '')}
          onClick={() => setType('background')}
        >
          {t('social:arMedia.backgrounds')}
        </Button>
      </section>
      <section className={styles.flexContainer}>
        {list?.map((item, itemIndex) => (
          <section key={item.id} className={styles.previewImageContainer}>
            <CardMedia onClick={() => setSelectedItem(item)} className={styles.previewImage} image={item.previewUrl} />
            <Typography>{item.title}</Typography>
          </section>
        ))}
      </section>
      {!selectedItem ? null : (
        <Button
          className={styles.startRecirding}
          onClick={async () => {
            setPreloading(true)
            if (XRPlugin.uploadFiles !== undefined) {
              await XRPlugin.uploadFiles({
                audioPath: selectedItem.audioUrl,
                audioId: selectedItem.audioId
              })
            }
            setPreloading(false)
            updateArMediaState(false)
            updateWebXRState(true, selectedItem.id)
          }}
          variant="contained"
        >
          {t('social:arMedia.start')}
        </Button>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ArMedia)
