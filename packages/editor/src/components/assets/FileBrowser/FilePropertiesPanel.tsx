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
import styles from '../styles.module.scss'
import { FileType } from './FileBrowserContentPanel'

import { logger } from '@etherealengine/client-core/src/user/services/AuthService'
import { StaticResourceType, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { saveProjectResources } from '../../../functions/saveProjectResources'
import { Button } from '../../inputs/Button'

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

  const isModified = useHookstate(false)

  const onChange = useCallback((state: State<any>) => {
    isModified.set(true)
    return (e) => {
      state.set(e.target.value)
    }
  }, [])

  const onSaveChanges = useCallback(async () => {
    if (isModified.value && resourceProperties.value.id) {
      const key = fileProperties.value!.key
      await Engine.instance.api.service(staticResourcePath).patch(resourceProperties.id.value, {
        key,
        tags: resourceProperties.tags.value,
        licensing: resourceProperties.licensing.value,
        attribution: resourceProperties.attribution.value
      })
      await saveProjectResources(resourceProperties.project.value)
      isModified.set(false)
      openProperties.set(false)
    }
  }, [])

  const staticResource = useFind(staticResourcePath, {
    query: {
      key: fileProperties.value!.key
    }
  })

  const resourceProperties = useHookstate({
    tags: [] as string[],
    id: '',
    project: '',
    attribution: '',
    licensing: ''
  })
  useEffect(() => {
    if (staticResource.data.length > 0) {
      if (staticResource.data.length > 1) logger.warn('Multiple resources with same key found')
      const resources = JSON.parse(JSON.stringify(staticResource.data[0])) as StaticResourceType
      if (resources) {
        resourceProperties.tags.set(resources.tags ?? [])
        resourceProperties.id.set(resources.id)
        resourceProperties.attribution.set(resources.attribution ?? '')
        resourceProperties.licensing.set(resources.licensing ?? '')
        resourceProperties.project.set(resources.project ?? '')
      }
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
          disabled={true}
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
        {resourceProperties.id.value && (
          <>
            <hr style={{ margin: '16px' }} />
            <InputText
              name="attribution"
              label={t('editor:layout.filebrowser.fileProperties.attribution')}
              onChange={onChange(resourceProperties.attribution)}
              value={resourceProperties.attribution.value}
            />
            <InputText
              name="licensing"
              label={t('editor:layout.filebrowser.fileProperties.licensing')}
              onChange={onChange(resourceProperties.licensing)}
              value={resourceProperties.licensing.value}
            />
            <Button
              onClick={() => {
                resourceProperties.tags.set([...(resourceProperties.tags.value ?? []), ''])
              }}
            >
              {t('editor:layout.filebrowser.fileProperties.addTag')}
            </Button>
            <div style={{ marginTop: '16px' }}>
              {(resourceProperties.tags.value ?? []).map((tag, index) => (
                <div style={{ display: 'flex', flexDirection: 'row', margin: '0, 16px 0 0' }}>
                  <InputText
                    key={index}
                    name={`tag${index}`}
                    label={t('editor:layout.filebrowser.fileProperties.tag')}
                    onChange={onChange(resourceProperties.tags[index])}
                    value={resourceProperties.tags[index].value}
                    sx={{ width: '100%', marginRight: '32px' }}
                  />
                  <Button
                    onClick={() => {
                      resourceProperties.tags.set(resourceProperties.tags.value.filter((_, i) => i !== index))
                    }}
                    style={{ width: '16px', height: '16px', margin: '8px 0 0 10px' }}
                  >
                    {' '}
                    x{' '}
                  </Button>
                </div>
              ))}
            </div>
            {isModified.value && (
              <Button onClick={onSaveChanges} style={{ marginTop: '15px' }}>
                {t('editor:layout.filebrowser.fileProperties.save-changes')}
              </Button>
            )}
          </>
        )}
      </form>
    </Dialog>
  )
}
