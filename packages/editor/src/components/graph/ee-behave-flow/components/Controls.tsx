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

import { faDownload, faPlay, faQuestion, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DefaultLogger,
  Engine,
  ManualLifecycleEventEmitter,
  Registry,
  readGraphFromJSON,
  registerCoreProfile,
  registerSceneProfile
} from 'behave-graph'
import React, { useState } from 'react'
import { ControlButton, Controls, useReactFlow } from 'reactflow'

import { flowToBehave } from '../transformers/flowToBehave'
import { sleep } from '../util/sleep'
import { ClearModal } from './ClearModal'
import { HelpModal } from './HelpModal'
import { LoadModal } from './LoadModal'
import { SaveModal } from './SaveModal'

const CustomControls = () => {
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const instance = useReactFlow()

  const handleRun = async () => {
    const registry = new Registry()
    const logger = new DefaultLogger()
    const manualLifecycleEventEmitter = new ManualLifecycleEventEmitter()
    registerCoreProfile(registry, logger, manualLifecycleEventEmitter)
    registerSceneProfile(registry)

    const nodes = instance.getNodes()
    const edges = instance.getEdges()
    const graphJson = flowToBehave(nodes, edges)
    const graph = readGraphFromJSON(graphJson, registry)

    const engine = new Engine(graph)

    if (manualLifecycleEventEmitter.startEvent.listenerCount > 0) {
      manualLifecycleEventEmitter.startEvent.emit()
      await engine.executeAllAsync(5)
    }

    if (manualLifecycleEventEmitter.tickEvent.listenerCount > 0) {
      const iterations = 20
      const tickDuration = 0.01
      for (let tick = 0; tick < iterations; tick++) {
        manualLifecycleEventEmitter.tickEvent.emit()
        engine.executeAllSync(tickDuration)
        await sleep(tickDuration)
      }
    }

    if (manualLifecycleEventEmitter.endEvent.listenerCount > 0) {
      manualLifecycleEventEmitter.endEvent.emit()
      await engine.executeAllAsync(5)
    }
  }

  return (
    <>
      <Controls>
        <ControlButton title="Help" onClick={() => setHelpModalOpen(true)}>
          <FontAwesomeIcon icon={faQuestion} />
        </ControlButton>
        <ControlButton title="Load" onClick={() => setLoadModalOpen(true)}>
          <FontAwesomeIcon icon={faUpload} />
        </ControlButton>
        <ControlButton title="Save" onClick={() => setSaveModalOpen(true)}>
          <FontAwesomeIcon icon={faDownload} />
        </ControlButton>
        <ControlButton title="Clear" onClick={() => setClearModalOpen(true)}>
          <FontAwesomeIcon icon={faTrash} />
        </ControlButton>
        <ControlButton title="Run" onClick={() => handleRun()}>
          <FontAwesomeIcon icon={faPlay} />
        </ControlButton>
      </Controls>
      <LoadModal open={loadModalOpen} onClose={() => setLoadModalOpen(false)} />
      <SaveModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ClearModal open={clearModalOpen} onClose={() => setClearModalOpen(false)} />
    </>
  )
}

export default CustomControls
