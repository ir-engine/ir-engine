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
import { FaDownload, FaPause, FaPlay, FaQuestion, FaTrash, FaUpload } from 'react-icons/fa6'
import { ControlButton, Controls } from 'reactflow'

import { GraphJSON, VariableJSON } from '@etherealengine/visual-script'

import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'
import { ClearModal } from './modals/ClearModal'
import { HelpModal } from './modals/HelpModal'
import { Examples, LoadModal } from './modals/LoadModal'
import { SaveModal } from './modals/SaveModal'

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
        <ControlButton title="Help" onClick={() => setHelpModalOpen(true)}>
          <FaQuestion />
        </ControlButton>
        <ControlButton title="Load" onClick={() => setLoadModalOpen(true)}>
          <FaUpload />
        </ControlButton>
        <ControlButton
          title="Save"
          onClick={() => {
            setSaveModalOpen(true)
          }}
        >
          <FaDownload />
        </ControlButton>
        <ControlButton title="Clear" onClick={() => setClearModalOpen(true)}>
          <FaTrash />
        </ControlButton>
        <ControlButton title="Run" onClick={togglePlay}>
          {playing ? <FaPause /> : <FaPlay />}
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
