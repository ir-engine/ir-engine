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

import { Object3D } from 'three'

import { Entity } from '../../ecs/classes/Entity'

export type ComponentDeserializeFunction = (entity: Entity, componentData: any) => void
export type ComponentSerializeFunction = (entity: Entity) => any | undefined
/** @todo: deprecate & replace with just `(entity: Entity) => ...` to enable functions to be reactive to data changes, rather than passing properties in */
export type ComponentUpdateFunction = (entity: Entity) => void
export type ComponentShouldDeserializeFunction = () => boolean
export type ComponentPrepareForGLTFExportFunction = (object: Object3D) => void

/** @deprecated */
export type SceneLoaderType = {
  /**
   * @deprecated An override function to specify custom transformations from ECS to JSON
   * - if no function is set, data will be copied from the component via JSON serialization
   * - a function returning null or undefined will not add the component to JSON
   */
  serialize?: ComponentSerializeFunction
  /**
   * @deprecated An override function to specify custom transformations from JSON to ECS
   * - if no function is set, data will be copied to the component
   * - not setting defaultData will result in this component being treated as a tag component
   */
  deserialize?: ComponentDeserializeFunction
}
