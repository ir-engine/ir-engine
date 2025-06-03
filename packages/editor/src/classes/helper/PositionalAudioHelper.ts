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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { getOptionalComponent, removeComponent, setComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { PositionalAudioHelperComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioHelperComponent'
import { MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { useEffect } from 'react'

// must re-ewrite this to use the reactor instead of a new component
export const PositionalAudioHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const audio = useComponent(parentEntity, PositionalAudioComponent)
  const mediaElement = useOptionalComponent(parentEntity, MediaElementComponent)
  const debugEnabled = selected || hovered

  useEffect(() => {
    if (debugEnabled) {
      const name = getOptionalComponent(parentEntity, NameComponent)
      setComponent(parentEntity, PositionalAudioHelperComponent, {
        name: name ? `${name}-positional-audio-helper` : undefined
      })
      setComponent(parentEntity, ActiveHelperComponent, { helperSelectedGizmo: parentEntity, directional: true }) // we have multiple child helpers so we use the parentEntity as the selected gizmo
    }
    return () => {
      removeComponent(parentEntity, PositionalAudioHelperComponent)
    }
  }, [debugEnabled, mediaElement?.element, audio.maxDistance, audio.coneInnerAngle, audio.coneOuterAngle])

  return null
}
