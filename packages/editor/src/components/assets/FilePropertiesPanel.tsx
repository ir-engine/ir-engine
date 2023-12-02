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
import React, { useCallback, useEffect } from 'react'

import { NO_PROXY, State, useHookstate } from '@etherealengine/hyperflux'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { FileType } from './FileBrowserContentPanel'
import styles from './styles.module.scss'

import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { Button } from '../inputs/Button'

export const FilePropertiesPanel = (props: {
  openProperties: State<boolean>
  fileProperties: State<FileType | null>
}) => {
  const { openProperties, fileProperties } = props
  const { t } = useTranslation()
  if (!fileProperties.value) return null

  const modifiableProperties: State<FileType> = useHookstate(
    JSON.parse(JSON.stringify(fileProperties.get(NO_PROXY))) as FileType
  )

  const onChange = useCallback((state: State<any>) => {
    return (e) => {
      state.set(e.target.value)
    }
  }, [])

  const staticResource = useHookstate(() =>
    Engine.instance.api.service(staticResourcePath).find({
      query: {
        key: fileProperties.value!.key
      }
    })
  )

  const tags: State<string[]> = useHookstate([])

  useEffect(() => {
    if (!staticResource.promised) {
      const resources = staticResource.data.value
      resources[0] && tags.set(JSON.parse(JSON.stringify(resources[0].tags)))
    }
  }, [staticResource])

  return (
    <Dialog
      open={openProperties.value}
      onClose={() => openProperties.set(false)}
      classes={{ paper: styles.paperDialog }}
    >
      <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }}>
        {`${fileProperties.value.name} ${fileProperties.value.type == 'folder' ? 'folder' : 'file'} Properties`}
      </DialogTitle>
      <form style={{ marginTop: '15px' }}>
        <InputText
          name="name"
          label={t('editor:layout.filebrowser.fileProperties.name')}
          onChange={onChange(modifiableProperties.name)}
          value={modifiableProperties.name.value}
        />
        <Grid container spacing={5}>
          <Grid item xs={6}>
            <Typography className={styles.primaryText}>{t('editor:layout.filebrowser.fileProperties.type')}</Typography>
            <Typography className={styles.primaryText}>{t('editor:layout.filebrowser.fileProperties.size')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography className={styles.secondaryText}>{modifiableProperties.type.value}</Typography>
            <Typography className={styles.secondaryText}>{modifiableProperties.size.value}</Typography>
          </Grid>
        </Grid>
        <Button
          onClick={() => {
            tags.set([...tags.value, ''])
          }}
        >
          Add Tag
        </Button>
        {tags.value.map((tag, index) => (
          <InputText
            key={index}
            name={`tag${index}`}
            label={t('editor:layout.filebrowser.fileProperties.tag')}
            onChange={onChange(tags[index])}
            value={tags[index].value}
          />
        ))}
      </form>
    </Dialog>
  )
}
