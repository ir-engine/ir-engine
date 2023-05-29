import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import FileBrowserContentPanel from '@etherealengine/editor/src/components/assets/FileBrowserContentPanel'
import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import DrawerView from '../../common/DrawerView'
import { AdminSingleRecordingService, AdminSingleRecordingState } from '../../services/RecordingService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedRecordingId: RecordingResult['id'] | null
  onClose: () => void
}

const RecordingFilesDrawer = ({ open, onClose, selectedRecordingId }: Props) => {
  const assetsPreviewPanelRef = React.useRef()

  const { t } = useTranslation()
  const adminSingleRecording = useHookstate(getMutableState(AdminSingleRecordingState))

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    ;(assetsPreviewPanelRef.current as any)?.onSelectionChanged?.(props)
  }

  useEffect(() => {
    if (selectedRecordingId) {
      AdminSingleRecordingService.fetchSingleAdminRecording(selectedRecordingId)
    }
  }, [selectedRecordingId])

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <>
          <DialogTitle className={styles.textAlign}>
            {`${t('admin:components.recording.recordingFiles')} ${adminSingleRecording.recording.value?.id}`}
          </DialogTitle>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, minHeight: 150 }}>
              {selectedRecordingId && (
                <FileBrowserContentPanel
                  disableDnD
                  selectedFile={selectedRecordingId}
                  onSelectionChanged={onSelectionChanged}
                  folderName="recordings"
                />
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <AssetsPreviewPanel ref={assetsPreviewPanelRef} />
            </Box>
          </Box>
        </>
      </Container>
    </DrawerView>
  )
}

export default RecordingFilesDrawer
