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

import { Assert, makeEventNodeDefinition, NodeCategory } from '../../../../VisualScriptModule'
import { IScene } from '../../abstractions/IScene'

type State = {
  jsonPath?: string | undefined
  handleNodeClick?: ((jsonPath: string) => void) | undefined
}

const initialState = (): State => ({})

// very 3D specific.
export const OnSceneNodeClick = makeEventNodeDefinition({
  typeName: 'scene/nodeClick',
  category: NodeCategory.Event,
  label: 'On Scene Node Click',
  in: {
    jsonPath: (_, graphApi) => {
      const scene = graphApi.getDependency<IScene>('IScene')

      return {
        valueType: 'string',
        choices: scene?.getRaycastableProperties()
      }
    }
  },
  out: {
    flow: 'flow'
  },
  initialState: initialState(),
  init: ({ read, commit, graph }) => {
    const handleNodeClick = () => {
      commit('flow')
    }

    const jsonPath = read<string>('jsonPath')

    const scene = graph.getDependency<IScene>('IScene')
    scene?.addOnClickedListener(jsonPath, handleNodeClick)

    const state: State = {
      handleNodeClick,
      jsonPath
    }

    return state
  },
  dispose: ({ state: { handleNodeClick, jsonPath }, graph: { getDependency } }) => {
    Assert.mustBeTrue(handleNodeClick !== undefined)
    Assert.mustBeTrue(jsonPath !== undefined)

    if (!jsonPath || !handleNodeClick) return {}

    const scene = getDependency<IScene>('scene')
    scene?.removeOnClickedListener(jsonPath, handleNodeClick)

    return {}
  }
})
