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

import { Metadata } from '../../Metadata'

export type ValueJSON = string | boolean | number | number[]

export type LinkJSON = { nodeId: string; socket: string }

export type NodeParameterValueJSON = { value: ValueJSON }
export type NodeParameterLinkJSON = { link: LinkJSON }
export type NodeParameterJSON = NodeParameterValueJSON | NodeParameterLinkJSON

export type NodeParametersJSON = {
  [key: string]: NodeParameterJSON
}

export type FlowsJSON = {
  [key: string]: LinkJSON
}

export type NodeConfigurationJSON = {
  [key: string]: ValueJSON
}

export type NodeJSON = {
  label?: string
  type: string
  id: string
  configuration?: NodeConfigurationJSON
  parameters?: NodeParametersJSON
  flows?: FlowsJSON
  metadata?: Metadata
}

export type VariableJSON = {
  label?: string
  id: string
  name: string
  valueTypeName: string
  initialValue: ValueJSON
  metadata?: Metadata
}

export type CustomEventParameterJSON = {
  name: string
  valueTypeName: string
  defaultValue: ValueJSON
}

export type CustomEventJSON = {
  label?: string
  id: string
  name: string
  parameters?: CustomEventParameterJSON[]
  metadata?: Metadata
}

export type GraphJSON = {
  name?: string
  nodes?: NodeJSON[]
  variables?: VariableJSON[]
  customEvents?: CustomEventJSON[]
  metadata?: Metadata
}
