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

import { assocPath, equals, mergeDeepRight, path } from 'rambdax'

import { makeInNOutFunctionDesc, NodeCategory } from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'logic/object/constant',
  category: NodeCategory.Logic,
  label: 'Object',
  in: ['object'],
  out: 'object',
  exec: (a: object) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'logic/object/compare/equal',
  category: NodeCategory.Logic,
  label: '=',
  in: ['object', 'object'],
  out: 'boolean',
  exec: (a: object, b: object) => equals(a, b)
})

export const AssocPath = makeInNOutFunctionDesc({
  name: 'logic/assocPath/object',
  category: NodeCategory.Logic,
  label: 'Assoc Path',
  in: [
    {
      path: 'string'
    },
    {
      newValue: 'object'
    },
    {
      obj: 'object'
    }
  ],
  out: 'object',
  exec: (pathStr: string, newValue: object, obj: object) => {
    const path = pathStr.split('.')
    return assocPath(path, newValue, obj)
  }
})

export const MergeDeep = makeInNOutFunctionDesc({
  name: 'logic/object/mergeDeep',
  category: NodeCategory.Logic,
  label: 'Merge Deep',
  in: ['object', 'object'],
  out: 'object',
  exec: (a: object, b: object) => mergeDeepRight(a, b)
})

export const Path = makeInNOutFunctionDesc({
  name: 'logic/object/path/object',
  category: NodeCategory.Logic,
  label: 'Path',
  in: [
    {
      pathToSearch: 'string'
    },
    {
      obj: 'object'
    }
  ],
  out: 'object',
  exec: (pathToSearch: string, obj: object) => path(pathToSearch, obj)
})

export const PathAsString = makeInNOutFunctionDesc({
  name: 'logic/object/path/string',
  category: NodeCategory.Logic,
  label: 'Path',
  in: [
    {
      pathToSearch: 'string'
    },
    {
      obj: 'object'
    }
  ],
  out: 'string',
  exec: (pathToSearch: string, obj: object) => path(pathToSearch, obj)
})

export const PathAsInteger = makeInNOutFunctionDesc({
  name: 'logic/object/path/integer',
  category: NodeCategory.Logic,
  label: 'Path',
  in: [
    {
      pathToSearch: 'string'
    },
    {
      obj: 'object'
    }
  ],
  out: 'integer',
  exec: (pathToSearch: string, obj: object) => path(pathToSearch, obj)
})
