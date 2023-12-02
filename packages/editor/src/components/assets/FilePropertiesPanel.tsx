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
