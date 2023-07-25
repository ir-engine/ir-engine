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

import { useEffect, useState } from 'react'

import {
  DefaultLogger,
  Dependencies,
  makeCoreDependencies,
  makeEngineDependencies,
  ManualLifecycleEventEmitter
} from '@etherealengine/engine/src/behave-graph/nodes'

export const useCoreDependencies = () => {
  const [dependencies] = useState(() =>
    makeCoreDependencies({
      lifecycleEmitter: new ManualLifecycleEventEmitter(),
      logger: new DefaultLogger()
    })
  )

  return dependencies
}

export const useEngineDependencies = () => {
  const [dependencies] = useState(() => makeEngineDependencies())

  return dependencies
}
/*
export const useSceneDependencies = () => {
  const [dependencies] = useState(() =>
    makeSceneDependencies({
      scene: new DummyScene()
    })
  )

  return dependencies
}
*/

export const useMergeDependencies = (
  a: Dependencies | undefined,
  b: Dependencies | undefined
): Dependencies | undefined => {
  const [merged, setMerged] = useState<Dependencies>()

  useEffect(() => {
    if (!a || !b) setMerged(undefined)
    else
      setMerged({
        ...a,
        ...b
      })
  }, [a, b])

  return merged
}

export const useDependency = (dependency: any, createDependency: (dependency: any) => Dependencies) => {
  const [dependencies, setDependencies] = useState<Dependencies>()

  useEffect(() => {
    if (typeof dependency === 'undefined') setDependencies(undefined)
    else setDependencies(createDependency(dependency))
  }, [dependency, createDependency])

  return dependencies
}
