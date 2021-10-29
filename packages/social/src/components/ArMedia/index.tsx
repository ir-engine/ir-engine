/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { Button, CardMedia, Typography } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import { ArMediaService } from '@xrengine/client-core/src/social/state/ArMediaService'
import { useArMediaState } from '@xrengine/client-core/src/social/state/ArMediaState'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
// import {  Plugins } from '@capacitor/core';
import Preloader from '@xrengine/social/src/components/Preloader'

// @ts-ignore
import styles from './ArMedia.module.scss'

// const {XRPlugin} = Plugins;
import { XRPlugin } from 'webxr-native'
import { useHistory } from 'react-router-dom'
import { ArMedia } from '@xrengine/common/src/interfaces/ArMedia'
interface Props {
  projects?: any[]
  view?: any
}

const ArMedia = (props: Props) => {
  const [type, setType] = useState('clip')
  const [list, setList] = useState<ArMedia[]>([])
  const [preloading, setPreloading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const arMediaState = useArMediaState()
  useEffect(() => {
    ArMediaService.getArMedia()
  }, [])
  const { t } = useTranslation()
  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    if (arMediaState.fetching.value === false) {
      setList(arMediaState?.list?.value?.filter((item) => item.type === type) || [])
    }
  }, [arMediaState.fetching.value, type])

  return (
    <section className={styles.arMediaContainer}>
      {preloading && <Preloader text={'Loading...'} />}
      <Button
        variant="text"
        className={styles.backButton}
        onClick={() => {
          PopupsStateService.updateArMediaState(false)
        }}
      >
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
        {/*<Button*/}
        {/*  variant={type === 'background' ? 'contained' : 'text'}*/}
        {/*  className={styles.switchButton + (type === 'background' ? ' ' + styles.active : '')}*/}
        {/*  onClick={() => setType('background')}*/}
        {/*>*/}
        {/*  {t('social:arMedia.backgrounds')}*/}
        {/*</Button>*/}
      </section>
      <section className={styles.flexContainer}>
        {list.map((item, itemIndex) => (
          <section key={item.id} className={styles.previewImageContainer}>
            <CardMedia onClick={() => setSelectedItem(item)} className={styles.previewImage} image={item.previewUrl} />
            <Typography>{item.title}</Typography>
          </section>
        ))}
      </section>
      {type == 'background' ? <text className={styles.textC}>Coming soon ...</text> : ' '}
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
            PopupsStateService.updateArMediaState(false)
            PopupsStateService.updateWebXRState(true, selectedItem.id)
          }}
          variant="contained"
        >
          {t('social:arMedia.start')}
        </Button>
      )}
    </section>
  )
}

export default ArMedia
