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

import React, { useState } from 'react'
import { PiDownloadSimpleBold, PiPauseBold, PiPlayBold, PiTrashSimpleBold, PiUploadSimpleBold } from 'react-icons/pi'
import { ControlButton, Controls } from 'reactflow'

import { NodeSpecGenerator } from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import { GraphJSON, VariableJSON } from '@etherealengine/visual-script'
import { ClearModal } from '../modals/clear'
import { HelpModal } from '../modals/help'
import { Examples, LoadModal } from '../modals/load'
import { SaveModal } from '../modals/save'

export type CustomControlsProps = {
  playing: boolean
  togglePlay: () => void
  onSaveVisualScript: (value: GraphJSON) => void
  setVisualScript: (value: GraphJSON) => void
  variables: VariableJSON[]
  examples: Examples
  specGenerator: NodeSpecGenerator | undefined
}

export const CustomControls: React.FC<CustomControlsProps> = ({
  playing,
  togglePlay,
  setVisualScript,
  examples,
  variables,
  specGenerator
}: CustomControlsProps) => {
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  // load modal should have a drop area for json files
  // save modal should provide a path or file browser to save, or just save automatically
  return (
    <>
      <Controls>
        {/*<ControlButton title="Help" onClick={() => setHelpModalOpen(true)}>
          <FaQuestion />
        </ControlButton>*/}
        <ControlButton title="Load" onClick={() => setLoadModalOpen(true)}>
          <PiUploadSimpleBold />
        </ControlButton>
        <ControlButton
          title="Save"
          onClick={() => {
            setSaveModalOpen(true)
          }}
        >
          <PiDownloadSimpleBold />
        </ControlButton>
        <ControlButton title="Clear" onClick={() => setClearModalOpen(true)}>
          <PiTrashSimpleBold />
        </ControlButton>
        <ControlButton title="Run" onClick={togglePlay}>
          {playing ? <PiPauseBold /> : <PiPlayBold />}
        </ControlButton>
      </Controls>
      <LoadModal
        open={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        setVisualScript={setVisualScript}
        examples={examples}
      />
      {specGenerator && (
        <SaveModal
          open={saveModalOpen}
          variables={variables}
          specGenerator={specGenerator}
          onClose={() => setSaveModalOpen(false)}
        />
      )}
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ClearModal open={clearModalOpen} onClose={() => setClearModalOpen(false)} />
    </>
  )
}

export default CustomControls
