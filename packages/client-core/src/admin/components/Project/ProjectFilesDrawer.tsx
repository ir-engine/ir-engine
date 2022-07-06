import React from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'
import FileBrowserContentPanel from '@xrengine/editor/src/components/assets/FileBrowserContentPanel'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'

import DrawerView from '../../common/DrawerView'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedProject: ProjectInterface
  onClose: () => void
}

const ProjectFilesDrawer = ({ open, selectedProject, onClose }: Props) => {
  const { t } = useTranslation()
  const assetsPreviewPanelRef = React.useRef()

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.(props)
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {`${selectedProject.name} ${t('admin:components.project.files')}`}
        </DialogTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, minHeight: 150 }}>
            <FileBrowserContentPanel
              disableDnD
              selectedFile={selectedProject.name}
              onSelectionChanged={onSelectionChanged}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <AssetsPreviewPanel ref={assetsPreviewPanelRef} />
          </Box>
        </Box>
      </Container>
    </DrawerView>
  )
}

export default ProjectFilesDrawer
