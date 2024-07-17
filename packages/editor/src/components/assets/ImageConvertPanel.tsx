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

import { Dialog, DialogTitle, Grid, Typography } from '@mui/material'
import React from 'react'

import { ImageConvertParms } from '@etherealengine/engine/src/assets/constants/ImageConvertParms'
import { State } from '@etherealengine/hyperflux'

import { imageConvertPath } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs'
import { FileType } from '@etherealengine/ui/src/components/editor/panels/Files/container'
import { Button } from '../inputs/Button'

import BooleanInput from '@etherealengine/ui/src/components/editor/input/Boolean'
import NumericInput from '@etherealengine/ui/src/components/editor/input/Numeric'
import SelectInput from '@etherealengine/ui/src/components/editor/input/Select'
import styles from './styles.module.scss'

export default function ImageConvertPanel({
  openConvert,
  fileProperties,
  convertProperties,
  onRefreshDirectory
}: {
  openConvert: State<boolean>
  fileProperties: FileType
  convertProperties: State<ImageConvertParms>
  onRefreshDirectory: () => Promise<void>
}) {
  function convertImage() {
    const props = fileProperties
    convertProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
    Engine.instance.api
      .service(imageConvertPath)
      .create({
        ...convertProperties.value
      })
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
        {fileProperties?.name}
      </DialogTitle>
      <Typography>{fileProperties?.isFolder ? 'Directory' : 'File'}</Typography>
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
        {convertProperties.resize.value && (
          <>
            <Grid item xs={4}>
              <Typography className={styles.secondaryText}>Width</Typography>
            </Grid>
            <Grid item xs={8}>
              <NumericInput
                value={convertProperties.width.value}
                onChange={(val: number) => convertProperties.width.set(val)}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography className={styles.secondaryText}>Height</Typography>
            </Grid>
            <Grid item xs={8}>
              <NumericInput
                value={convertProperties.height.value}
                onChange={(val: number) => convertProperties.height.set(val)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={convertImage}> Convert </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Dialog>
  )
}
