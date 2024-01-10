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
import { useTranslation } from 'react-i18next'

import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import FileBrowserContentPanel from '@etherealengine/editor/src/components/assets/FileBrowser/FileBrowserContentPanel'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import { RecordingID, recordingPath } from '@etherealengine/common/src/schema.type.module'
import { useGet } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import DrawerView from '../../common/DrawerView'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedRecordingId: RecordingID | undefined
  onClose: () => void
}

const RecordingFilesDrawer = ({ open, onClose, selectedRecordingId }: Props) => {
  const assetsPreviewPanelRef = React.useRef()

  const { t } = useTranslation()

  const recordingData = useGet(recordingPath, selectedRecordingId).data

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    ;(assetsPreviewPanelRef.current as any)?.onSelectionChanged?.(props)
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <>
          <DialogTitle className={styles.textAlign}>
            {`${t('admin:components.recording.recordingFiles')} ${recordingData?.id}`}
          </DialogTitle>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, minHeight: 150 }}>
              {selectedRecordingId && (
                <FileBrowserContentPanel
                  disableDnD
                  selectedFile={selectedRecordingId}
                  onSelectionChanged={onSelectionChanged}
                  folderName="recordings"
                  nestingDirectory={selectedRecordingId}
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
