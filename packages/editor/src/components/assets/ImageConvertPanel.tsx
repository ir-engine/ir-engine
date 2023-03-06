import React from 'react'

import { API } from '@etherealengine/client-core/src/API'
import { ImageConvertParms } from '@etherealengine/engine/src/assets/constants/ImageConvertParms'
import { State } from '@etherealengine/hyperflux'

import { Dialog, DialogTitle, Grid, Typography } from '@mui/material'

import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import SelectInput from '../inputs/SelectInput'
import styles from './styles.module.scss'

export default function ImageConvertPanel({
  openConvert,
  fileProperties,
  convertProperties,
  onRefreshDirectory
}: {
  openConvert: State<boolean>
  fileProperties: State<any>
  convertProperties: State<ImageConvertParms>
  onRefreshDirectory: () => Promise<void>
}) {
  function convertImage() {
    const props = fileProperties.value
    convertProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
    API.instance.client
      .service('image-convert')
      .create(convertProperties.value)
      .then(() => {
        onRefreshDirectory()
        openConvert.set(false)
      })
  }
  return (
    <Dialog
      open={openConvert.value}
      onClose={() => openConvert.set(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      classes={{ paper: styles.paperDialog }}
    >
      <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }} id="alert-dialog-title">
        {fileProperties.value?.name}
      </DialogTitle>
      <Typography>{fileProperties.value?.isFolder ? 'Directory' : 'File'}</Typography>
      <Grid container spacing={3} style={{ width: '100%', margin: '2 rem' }}>
        <Grid item xs={12} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%', textAlign: 'center' }}>
          <Typography className={styles.primatyText}>Convert</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Format:</Typography>
        </Grid>
        <Grid item xs={8}>
          <SelectInput
            options={[
              { label: 'JPG', value: 'jpg' },
              { label: 'PNG', value: 'png' },
              { label: 'WEBP', value: 'webp' }
            ]}
            value={convertProperties.format.value}
            onChange={(val: 'jpg' | 'png' | 'webp') => convertProperties.format.set(val)}
          />
        </Grid>
        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Resize</Typography>
        </Grid>
        <Grid item xs={8}>
          <BooleanInput
            value={convertProperties.resize.value}
            onChange={(val: boolean) => convertProperties.resize.set(val)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={convertImage}> Convert </Button>
        </Grid>
      </Grid>
    </Dialog>
  )
}
