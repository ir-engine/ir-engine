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

import { Operation } from 'rfc6902'
import { AddOperation, CopyOperation, MoveOperation, ReplaceOperation } from 'rfc6902/diff'

/**
 * Takes a list of operations, and removes any redundant operations.
 * @param {Operation[]} operations
 * @returns {Operation[]}
 */
export const squashOperations = (operations: Operation[]): Operation[] => {
  if (!operations || operations.length === 0) {
    return []
  }

  const operationsCopy = [...operations]

  const removedPaths = new Set<string>()
  for (const op of operationsCopy) {
    if (op.op === 'remove' && op.path !== undefined) {
      removedPaths.add(op.path)
    }
  }

  const result: Operation[] = []
  const processedPaths = new Map<string, number>()

  for (let i = 0; i < operationsCopy.length; i++) {
    const operation = operationsCopy[i]

    if (!operation || !operation.op || !operation.path) {
      continue
    }

    const { op, path } = operation

    if (!['add', 'remove', 'replace', 'move', 'copy', 'test'].includes(op)) {
      continue
    }

    if (op !== 'remove' && path && isPathCoveredByAnyParentPath(path, removedPaths)) {
      continue
    }

    switch (op) {
      case 'add':
      case 'replace': {
        if (processedPaths.has(path)) {
          const index = processedPaths.get(path)!
          result[index] = operation
        } else {
          processedPaths.set(path, result.length)
          result.push(operation)
        }
        break
      }

      case 'remove': {
        for (let j = result.length - 1; j >= 0; j--) {
          const resultOp = result[j]
          if (resultOp.path !== path && resultOp.path.startsWith(path + '/')) {
            result.splice(j, 1)
            for (const [p, idx] of processedPaths.entries()) {
              if (idx > j) {
                processedPaths.set(p, idx - 1)
              }
            }
            processedPaths.delete(resultOp.path)
          }
        }

        if (processedPaths.has(path)) {
          const index = processedPaths.get(path)!
          const prevOp = result[index]
          if (prevOp.op === 'add' || prevOp.op === 'replace') {
            result.splice(index, 1)
            for (const [p, idx] of processedPaths.entries()) {
              if (idx > index) {
                processedPaths.set(p, idx - 1)
              }
            }
            processedPaths.delete(path)
          } else {
            result[index] = operation
          }
        } else {
          processedPaths.set(path, result.length)
          result.push(operation)
        }
        break
      }

      case 'move': {
        const fromPath = (operation as MoveOperation).from

        if (!fromPath) {
          continue
        }

        if (fromPath === path) {
          continue
        }

        if (isPathCoveredByAnyParentPath(fromPath, removedPaths)) {
          continue
        }

        let sourceIndex = -1
        for (let j = 0; j < result.length; j++) {
          if ((result[j].op === 'add' || result[j].op === 'replace') && result[j].path === fromPath) {
            sourceIndex = j
            break
          }
        }

        if (sourceIndex >= 0) {
          const sourceOp = result[sourceIndex] as AddOperation | ReplaceOperation
          const addOp: AddOperation = { op: 'add', path, value: sourceOp.value }
          if (processedPaths.has(path)) {
            const destIndex = processedPaths.get(path)!
            result[destIndex] = addOp
          } else {
            processedPaths.set(path, result.length)
            result.push(addOp)
          }

          result.splice(sourceIndex, 1)
          for (const [p, idx] of processedPaths.entries()) {
            if (idx > sourceIndex) {
              processedPaths.set(p, idx - 1)
            }
          }
          processedPaths.delete(fromPath)
        } else {
          processedPaths.set(path, result.length)
          result.push(operation)
        }
        break
      }

      case 'copy': {
        const fromPath = (operation as CopyOperation).from

        if (!fromPath) {
          continue
        }

        if (isPathCoveredByAnyParentPath(fromPath, removedPaths)) {
          continue
        }

        if (processedPaths.has(path)) {
          const index = processedPaths.get(path)!
          result[index] = operation
        } else {
          processedPaths.set(path, result.length)
          result.push(operation)
        }
        break
      }

      case 'test': {
        result.push(operation)
        break
      }
    }
  }

  const removeOps: Operation[] = []
  const otherOps: Operation[] = []

  for (const op of result) {
    if (op.op === 'remove') {
      removeOps.push(op)
    } else {
      otherOps.push(op)
    }
  }

  // Sort remove operations by path length (descending) to remove deepest paths first
  removeOps.sort((a, b) => b.path.length - a.path.length)

  return [...removeOps, ...otherOps]
}

/**
 * Checks if a path is covered by any parent path in the given set
 */
const isPathCoveredByAnyParentPath = (path: string, parentPaths: Set<string>): boolean => {
  if (!path || path === '' || path === '/') {
    return false
  }

  const pathParts = path.split('/')

  for (let i = pathParts.length - 1; i > 0; i--) {
    const parentPath = pathParts.slice(0, i).join('/')
    if (parentPaths.has(parentPath)) {
      return true
    }
  }

  return false
}
