import React from 'react'

import { API } from '@etherealengine/client-core/src/API'
import { KTX2EncodeArguments } from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { State } from '@etherealengine/hyperflux'

import { Button, Dialog, DialogTitle, Grid, Typography } from '@mui/material'

import BooleanInput from '../inputs/BooleanInput'
import Scrubber from '../inputs/Scrubber'
import SelectInput from '../inputs/SelectInput'
import styles from './styles.module.scss'

export default function CompressionPanel({
  openCompress,
  fileProperties,
  compressProperties,
  onRefreshDirectory
}: {
  openCompress: State<boolean>
  fileProperties: State<any>
  compressProperties: State<KTX2EncodeArguments>
  onRefreshDirectory: () => Promise<void>
}) {
  const compressContent = async () => {
    const props = fileProperties.value
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
    const compressedPath = await API.instance.client.service('ktx2-encode').create(compressProperties.value)
    await onRefreshDirectory()
    openCompress.set(false)
  }
  return (
    <Dialog
      open={openCompress.value}
      onClose={() => openCompress.set(false)}
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
          <Typography className={styles.primatyText}>Compress</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Mode:</Typography>
        </Grid>
        <Grid item xs={8}>
          <SelectInput
            options={[
              { label: 'ETC1S', value: 'ETC1S' },
              { label: 'UASTC', value: 'UASTC' }
            ]}
            value={compressProperties.mode.value}
            onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
          />
        </Grid>

        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Quality:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Scrubber
            tag="div"
            value={compressProperties.quality.value}
            onChange={(val) => compressProperties.quality.set(val)}
            min={1}
            max={255}
            smallStep={1}
            mediumStep={1}
            largeStep={5}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            Level: {compressProperties.quality.value}
          </Scrubber>
        </Grid>

        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Mipmaps:</Typography>
        </Grid>
        <Grid item xs={8}>
          <BooleanInput
            value={compressProperties.mipmaps.value}
            onChange={(val) => compressProperties.mipmaps.set(val)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button onClick={compressContent}> Compress </Button>
        </Grid>
      </Grid>
    </Dialog>
  )
}
