import React from 'react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'save-as'

import config from '@etherealengine/common/src/config'
import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import FileBrowserContentPanel from '@etherealengine/editor/src/components/assets/FileBrowserContentPanel'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { API } from '../../../API'
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

  const handleDownloadProject = async () => {
    const url = `/projects/${selectedProject.name}`
    const data = await API.instance.client.service('archiver').get(url)
    const blob = await (await fetch(`${config.client.fileServer}/${data}`)).blob()
    saveAs(blob, selectedProject.name + '.zip')
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
        <IconButton
          title={t('admin:components.project.downloadProject')}
          className={styles.iconButton}
          style={{ position: 'absolute', bottom: '5%', right: '5%' }}
          name="download"
          disabled={!selectedProject.repositoryPath}
          onClick={() => handleDownloadProject()}
          icon={<Icon type="Download" />}
        />
      </Container>
    </DrawerView>
  )
}

export default ProjectFilesDrawer
