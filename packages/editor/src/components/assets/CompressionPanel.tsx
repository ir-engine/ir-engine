/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { API } from '@etherealengine/client-core/src/API'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { KTX2EncodeArguments } from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { State } from '@etherealengine/hyperflux'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import { Button, Dialog, DialogTitle, Grid, Typography } from '@mui/material'

import BooleanInput from '../inputs/BooleanInput'
import Scrubber from '../inputs/Scrubber'
import SelectInput from '../inputs/SelectInput'
import { FileType } from './FileBrowserContentPanel'
import styles from './styles.module.scss'

export default function CompressionPanel({
  openCompress,
  fileProperties,
  compressProperties,
  onRefreshDirectory
}: {
  openCompress: State<boolean>
  fileProperties: State<FileType>
  compressProperties: State<KTX2EncodeArguments>
  onRefreshDirectory: () => Promise<void>
}) {
  const compressContentInBrowser = async () => {
    const props = fileProperties.value
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
    const ktx2Encoder = new KTX2Encoder()

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        resolve(img)
      }
      img.src = compressProperties.src.value
    })

    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, img.width, img.height)

    const data = await ktx2Encoder.encode(imageData, {
      uastc: compressProperties.mode.value === 'UASTC',
      qualityLevel: compressProperties.quality.value,
      mipmaps: compressProperties.mipmaps.value,
      compressionLevel: 2,
      yFlip: compressProperties.flipY.value,
      srgb: !compressProperties.linear.value
    })

    const newFileName = props.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = props.key.replace(/(.*\/).*/, '$1')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    await uploadToFeathersService('file-browser/upload', [file], {
      fileName: newFileName,
      path,
      contentType: file.type
    }).promise
    await onRefreshDirectory()
    openCompress.set(false)
  }

  /** @todo */
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
          <Typography className={styles.secondaryText}>Flip Y:</Typography>
        </Grid>
        <Grid item xs={8}>
          <BooleanInput value={compressProperties.flipY.value} onChange={compressProperties.flipY.set} />
        </Grid>

        <Grid item xs={4}>
          <Typography className={styles.secondaryText}>Linear Color Space:</Typography>
        </Grid>
        <Grid item xs={8}>
          <BooleanInput value={compressProperties.linear.value} onChange={compressProperties.linear.set} />
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
          <Button onClick={compressContentInBrowser}> Compress </Button>
        </Grid>
      </Grid>
    </Dialog>
  )
}
