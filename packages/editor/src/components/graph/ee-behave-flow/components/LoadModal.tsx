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

import { GraphJSON } from 'behave-graph'
import HelloWorld from 'behave-graph/dist/graphs/core//HelloWorld.json'
import Delay from 'behave-graph/dist/graphs/core/async/Delay.json'
import Branch from 'behave-graph/dist/graphs/core/flow/Branch.json'
import Polynomial from 'behave-graph/dist/graphs/core/logic/Polynomial.json'
import SetGet from 'behave-graph/dist/graphs/core/variables/SetGet.json'
import React, { FC, useState } from 'react'
import { useReactFlow } from 'reactflow'

import { behaveToFlow } from '../transformers/behaveToFlow'
import { autoLayout } from '../util/autoLayout'
import { hasPositionMetaData } from '../util/hasPositionMetaData'
import { Modal } from './Modal'

// TODO remove when json types fixed in behave-graph
const examples = {
  branch: Branch as unknown as GraphJSON,
  delay: Delay as unknown as GraphJSON,
  helloWorld: HelloWorld as unknown as GraphJSON,
  polynomial: Polynomial as unknown as GraphJSON,
  setGet: SetGet as unknown as GraphJSON
} as Record<string, GraphJSON>

export type LoadModalProps = {
  open?: boolean
  onClose: () => void
}

export const LoadModal: FC<LoadModalProps> = ({ open = false, onClose }) => {
  const [value, setValue] = useState<string>()
  const [selected, setSelected] = useState('')

  const instance = useReactFlow()

  const handleLoad = () => {
    let graph
    if (value !== undefined) {
      graph = JSON.parse(value) as GraphJSON
    } else if (selected !== '') {
      graph = examples[selected]
    }

    if (graph === undefined) return

    const [nodes, edges] = behaveToFlow(graph)

    if (hasPositionMetaData(graph) === false) {
      autoLayout(nodes, edges)
    }

    instance.setNodes(nodes)
    instance.setEdges(edges)

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView()
    }, 100)

    handleClose()
  }

  const handleClose = () => {
    setValue(undefined)
    setSelected('')
    onClose()
  }

  return (
    <Modal
      title="Load Graph"
      actions={[
        { label: 'Cancel', onClick: handleClose },
        { label: 'Load', onClick: handleLoad }
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        autoFocus
        className="border border-gray-300 w-full p-2 h-32 align-top"
        placeholder="Paste JSON here"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      ></textarea>
      <div className="p-4 text-center text-gray-800">or</div>
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-3"
        onChange={(e) => setSelected(e.target.value)}
        value={selected}
      >
        <option disabled value="">
          Select an example
        </option>
        <option value="branch">Branch</option>
        <option value="delay">Delay</option>
        <option value="helloWorld">Hello World</option>
        <option value="polynomial">Polynomial</option>
        <option value="setGet">Set/Get</option>
      </select>
    </Modal>
  )
}
