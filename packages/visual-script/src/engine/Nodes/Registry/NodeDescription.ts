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

import { IGraph } from '../../Graphs/Graph'
import { IHasNodeFactory, INodeDefinition, NodeFactory } from '../NodeDefinitions'
import { INode } from '../NodeInstance'
import { NodeConfiguration } from './../Node'
import { NodeCategory } from './NodeCategory'

export type NodeConfigurationDescription = {
  [key: string]: {
    valueType: string
    defaultValue?: any
  }
}

export function getNodeDescriptions(importWildcard: { [key: string]: INodeDefinition | any }): INodeDefinition[] {
  return Object.values(importWildcard).filter((obj) => typeof obj === 'object') as INodeDefinition[]
}

export interface INodeDescription {
  readonly typeName: string
  readonly category: NodeCategory | string
  readonly label: string
  readonly otherTypeNames: string[]
  readonly helpDescription: string
  readonly configuration: NodeConfigurationDescription
}

export type NodeFactoryWithDescription = (entry: NodeDescription, graph: IGraph, config: NodeConfiguration) => INode

export class NodeDescription implements INodeDescription, IHasNodeFactory {
  nodeFactory: NodeFactory

  constructor(
    public readonly typeName: string,
    public readonly category: NodeCategory | string,
    public readonly label: string = '',
    factory: NodeFactoryWithDescription,
    public readonly otherTypeNames: string[] = [],
    public readonly helpDescription: string = '',

    public readonly configuration: NodeConfigurationDescription = {}
  ) {
    this.nodeFactory = (graph, config) => factory(this, graph, config)
  }
}

export class NodeDescription2 extends NodeDescription {
  constructor(
    public properties: {
      typeName: string
      category: NodeCategory | string
      label?: string
      configuration?: NodeConfigurationDescription
      factory: NodeFactoryWithDescription
      otherTypeNames?: string[]
      helpDescription?: string
    }
  ) {
    super(
      properties.typeName,
      properties.category,
      properties.label,
      properties.factory,
      properties.otherTypeNames,
      properties.helpDescription,
      properties.configuration
    )
  }
}
