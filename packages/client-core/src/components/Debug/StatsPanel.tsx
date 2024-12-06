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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { defineQuery } from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import { RenderInfoState } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Stats from './stats'

export const StatsPanel = (props: { show: boolean }) => {
  const renderInfoState = useMutableState(RenderInfoState)
  const info = renderInfoState.visible.value && renderInfoState.info.value
  const lightQuery = defineQuery([LightTagComponent, VisibleComponent, SourceComponent])

  const toggleStats = () => {
    renderInfoState.visible.set(!renderInfoState.visible.value)
  }

  const { t } = useTranslation()
  const [statsArray, setStatsArray] = useState<ReturnType<typeof Stats>[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  let animateId = 0

  useEffect(() => {
    return () => cancelAnimationFrame(animateId)
  }, [])

  useEffect(() => {
    setupStatsArray()
    if (props.show) animateId = requestAnimationFrame(animate)
    else cancelAnimationFrame(animateId)
  }, [props.show])

  const setupStatsArray = () => {
    if (!statsRef.current) return

    statsRef.current.innerHTML = ''

    for (let i = 0; i < 3; i++) {
      statsArray[i] = Stats()
      statsArray[i].showPanel(i)
      statsRef.current?.appendChild(statsArray[i].dom)
    }

    setStatsArray([...statsArray])
  }

  const animate = () => {
    for (const stats of statsArray) stats.update()
    animateId = requestAnimationFrame(animate)
  }

  return (
    <div className="m-1 flex flex-col gap-0.5 rounded bg-neutral-600 p-1">
      <Text>{t('common:debug.stats')}</Text>
      <div className="flex gap-1 [&>div]:relative" ref={statsRef} />
      <Button variant="secondary" onClick={toggleStats} size="sm">
        {renderInfoState.visible.value ? 'Hide' : 'Show'}
      </Button>
      {info && (
        <ul className="list-none text-sm text-theme-secondary">
          <li>
            {t('editor:viewport.state.memory')}
            <ul className="ml-2 list-none">
              <li>
                {t('editor:viewport.state.geometries')}: {info.geometries}
              </li>
              <li>
                {t('editor:viewport.state.textures')}: {info.textures}
              </li>
              <li>
                {t('editor:viewport.state.texturesMB')}: {info.texturesMB}
              </li>
              <li>
                {t('editor:viewport.state.shaderComplexity')}: {info.shaderComplexity}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.render')}:
            <ul className="ml-2 list-none">
              <li>
                {t('editor:viewport.state.FPS')}: {Math.round(info.fps)}
              </li>
              <li>
                {t('editor:viewport.state.frameTime')}: {Math.round(info.frameTime)}ms
              </li>
              <li>
                {t('editor:viewport.state.calls')}: {info.calls}
              </li>
              <li>
                {t('editor:viewport.state.triangles')}: {info.triangles}
              </li>
              <li>
                {t('editor:viewport.state.points')}: {info.points}
              </li>
              <li>
                {t('editor:viewport.state.lines')}: {info.lines}
              </li>
              <li>
                {t('editor:viewport.state.lights')}: {lightQuery().length}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.sceneComplexity')}: {info.sceneComplexity}
          </li>
        </ul>
      )}
    </div>
  )
}
