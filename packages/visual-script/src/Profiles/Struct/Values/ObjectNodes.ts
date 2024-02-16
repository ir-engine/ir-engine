import { assocPath, equals, mergeDeepRight, path } from 'rambdax'
import { NodeCategory, makeInNOutFunctionDesc } from '../../../VisualScriptModule'

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
