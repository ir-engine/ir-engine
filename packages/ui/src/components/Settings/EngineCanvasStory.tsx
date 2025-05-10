/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { API as ClientAPI } from '@ir-engine/client-core/src/API'
import { createHyperStore } from '@ir-engine/hyperflux'
import React, { useRef, useState } from 'react'
import SettingsMenu from '.'

createHyperStore()
ClientAPI.createAPI()

interface EngineCanvasStoryProps {
  onClose?: () => void
  modelUrl?: string
}

/**
 * A story component that demonstrates loading a 3D model using the engine canvas
 */
const EngineCanvasStory: React.FC<EngineCanvasStoryProps> = ({
  onClose,
  modelUrl = '/static/editor/spawn-point.glb' // Default model
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  // Use the engine canvas with our container ref
  // useEngineCanvas(containerRef)

  // useLoadLocation({ locationName: 'https://test.com/testmodel' })

  return (
    <div id="engine-renderer-canvas-container" ref={containerRef} className="absolute z-10 h-full w-full bg-pink-200">
      {/* The engine canvas will be attached to this container */}

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <button
            className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close Settings' : 'Open 3D Engine Settings'}
          </button>
        </div>
      </div>

      {open && <SettingsMenu onClose={() => setOpen(false)} />}
    </div>
  )
}

export default EngineCanvasStory
