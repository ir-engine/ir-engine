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

import { debounce, Dialog, DialogTitle, Grid, Typography } from '@mui/material'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { NO_PROXY, State, useHookstate } from '@etherealengine/hyperflux'

import {
  createFileDigest,
  createStaticResourceDigest,
  FileType
} from '@etherealengine/ui/src/components/editor/panels/Files/container'
import { Button } from '../../inputs/Button'
import styles from '../styles.module.scss'

export const FilePropertiesPanel = (props: { openProperties: State<boolean>; fileProperties: State<FileType[]> }) => {
  const { openProperties, fileProperties } = props
  if (!fileProperties.value) return null

  const { t } = useTranslation()

  const fileStaticResources = useHookstate<StaticResourceType[]>([])
  const fileDigest = createFileDigest(fileProperties.value)
  const resourceDigest = useHookstate<StaticResourceType>(createStaticResourceDigest([]))
  const sharedFields = useHookstate<string[]>([])
  const modifiedFields = useHookstate<string[]>([])
  const sharedTags = useHookstate<string[]>([])

  let title: string
  let filename: string
  if (fileProperties.value.length === 1) {
    const firstFile = fileProperties.value[0]
    filename = firstFile.name
    title = `${filename} ${firstFile.type == 'folder' ? 'folder' : 'file'} Properties`
  } else {
    filename = ''
    title = `Properties of ${fileProperties.value.length} Items`
  }

  const onChange = (fieldName: string, state: State<any>) => {
    return (e) => {
      if (!modifiedFields.value.includes(fieldName)) {
        modifiedFields.set([...modifiedFields.value, fieldName])
      }
      state.set(e.target.value)
    }
  }

  const onSaveChanges = useCallback(async () => {
    if (modifiedFields.value.length > 0) {
      const addedTags: string[] = resourceDigest.tags.value!.filter((tag) => !sharedTags.value.includes(tag))
      const removedTags: string[] = sharedTags.value!.filter((tag) => !resourceDigest.tags.value!.includes(tag))
      for (const resource of fileStaticResources.value) {
        const oldTags = resource.tags ?? []
        const newTags = Array.from(new Set([...addedTags, ...oldTags.filter((tag) => !removedTags.includes(tag))]))
        await Engine.instance.api.service(staticResourcePath).patch(resource.id, {
          key: resource.key,
          tags: newTags,
          licensing: resourceDigest.licensing.value,
          attribution: resourceDigest.attribution.value
        })
      }
      modifiedFields.set([])
      openProperties.set(false)
    }
  }, [])

  useEffect(() => {
    const staticResourcesFindApi = () => {
      const query = {
        key: {
          $like: undefined,
          $or: fileProperties.value.map(({ key }) => ({
            key
          }))
        },
        $limit: 10000
      }

      Engine.instance.api
        .service(staticResourcePath)
        .find({ query })
        .then((resources) => {
          fileStaticResources.set(resources.data)
          const digest = createStaticResourceDigest(resources.data)
          resourceDigest.set(digest)
          sharedFields.set(
            Object.keys(resourceDigest).filter((key) => {
              const value = resourceDigest[key]
              return value.length !== ''
            })
          )
          sharedTags.set(resourceDigest.tags.get(NO_PROXY)!.slice() as string[])
        })
    }
    const debouncedQuery = debounce(staticResourcesFindApi, 500)
    debouncedQuery()
  }, [fileProperties])

  return (
    <Dialog
      open={openProperties.value}
      onClose={() => openProperties.set(false)}
      classes={{ paper: styles.paperDialog }}
    >
      <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }}>{title}</DialogTitle>
      <form style={{ marginTop: '15px' }}>
        {fileProperties.value.length === 1 && (
          <InputText
            name="name"
            label={t('editor:layout.filebrowser.fileProperties.name')}
            value={filename}
            disabled={true}
          />
        )}
        <Grid container spacing={5}>
          <Grid item xs={6}>
            <Typography className={styles.primaryText}>{t('editor:layout.filebrowser.fileProperties.type')}</Typography>
            <Typography className={styles.primaryText}>{t('editor:layout.filebrowser.fileProperties.size')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography className={styles.secondaryText}>{fileDigest.type}</Typography>
            <Typography className={styles.secondaryText}>
              {fileProperties.value
                .map((file) => file.size)
                .reduce((total, value) => total + parseInt(value ?? '0'), 0)}
            </Typography>
          </Grid>
        </Grid>
        {fileStaticResources.value.length > 0 && (
          <>
            <hr style={{ margin: '16px' }} />
            <InputText
              name="attribution"
              label={t('editor:layout.filebrowser.fileProperties.attribution')}
              onChange={onChange('attribution', resourceDigest.attribution)}
              value={
                fileProperties.value?.length > 1 && !sharedFields.value.includes('attribution')
                  ? ' - '
                  : resourceDigest.attribution.value
              }
            />
            <InputText
              name="licensing"
              label={t('editor:layout.filebrowser.fileProperties.licensing')}
              onChange={onChange('licensing', resourceDigest.licensing)}
              value={
                fileProperties.value?.length > 1 && !sharedFields.value.includes('licensing')
                  ? ' - '
                  : resourceDigest.licensing.value
              }
            />
            <Button
              onClick={() => {
                if (!modifiedFields.value.includes('tags')) {
                  modifiedFields.set([...modifiedFields.value, 'tags'])
                }
                resourceDigest.tags.set([...(resourceDigest.tags.value ?? []), ''])
              }}
            >
              {t('editor:layout.filebrowser.fileProperties.addTag')}
            </Button>
            <div style={{ marginTop: '16px' }}>
              {(resourceDigest.tags.value ?? []).map((_, index) => (
                <div style={{ display: 'flex', flexDirection: 'row', margin: '0, 16px 0 0' }}>
                  <InputText
                    key={index}
                    name={`tag${index}`}
                    label={t('editor:layout.filebrowser.fileProperties.tag')}
                    onChange={onChange('tags', resourceDigest.tags[index])}
                    value={resourceDigest.tags[index].value}
                    sx={{ width: '100%', marginRight: '32px' }}
                  />
                  <Button
                    onClick={() => {
                      if (!modifiedFields.value.includes('tags')) {
                        modifiedFields.set([...modifiedFields.value, 'tags'])
                      }
                      resourceDigest.tags.set(resourceDigest.tags.value!.filter((_, i) => i !== index))
                    }}
                    style={{ width: '16px', height: '16px', margin: '8px 0 0 10px' }}
                  >
                    {' '}
                    x{' '}
                  </Button>
                </div>
              ))}
            </div>
            {modifiedFields.value.length > 0 && (
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
