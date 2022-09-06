import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import DrawerView from '../../common/DrawerView'
import InputText from '../../common/InputText'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedResource: StaticResourceInterface
  onClose: () => void
}

const ResourceDrawerContent = ({ selectedResource, onClose }: Props) => {
  const { t } = useTranslation()
  const assetsPreviewPanelRef = React.useRef()

  useEffect(() => {
    ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({
      name: selectedResource.key,
      resourceUrl: selectedResource.url,
      contentType: selectedResource.mimeType
    } as AssetSelectionChangePropsType)
  }, [])

  return (
    <Container maxWidth="sm" className={styles.mt10}>
      <DialogTitle className={styles.textAlign}>{selectedResource.key}</DialogTitle>

      <InputText name="key" label={t('admin:components.resources.key')} value={selectedResource.key} disabled />

      <InputText
        name="mimeType"
        label={t('admin:components.resources.mimeType')}
        value={selectedResource.mimeType || ''}
        disabled
      />

      <InputText
        name="resourceType"
        label={t('admin:components.resources.resourceType')}
        value={selectedResource.staticResourceType || ''}
        disabled
      />

      <Typography>{t('admin:components.resources.preview')}</Typography>

      <Box sx={{ height: 300 }}>
        <AssetsPreviewPanel hideHeading ref={assetsPreviewPanelRef} />
      </Box>

      <DialogActions>
        <Button className={styles.outlinedButton} onClick={onClose}>
          {t('admin:components.common.cancel')}
        </Button>
      </DialogActions>
    </Container>
  )
}

const ResourceDrawer = (props: Props) => {
  const { open, onClose } = props
  return (
    <DrawerView open={open} onClose={onClose}>
      <ResourceDrawerContent {...props} />
    </DrawerView>
  )
}

export default ResourceDrawer
