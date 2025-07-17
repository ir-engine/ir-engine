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

import { SupportedScriptImports } from '@ir-engine/engine/src/script/SupportedScriptImports'
import { Node, Project } from 'ts-morph'
import * as ts from 'typescript'

/**
 * Set of allowed imports from SupportedScriptImports
 */
const ALLOWED_IMPORTS = new Set(SupportedScriptImports.map((item) => item.import))

/**
 * Disallowed function calls and their reasons
 */
const DISALLOWED_FUNCTIONS = new Map([
  ['eval', 'Use of eval() is not allowed for security reasons'],
  ['Function', 'Dynamic function creation is not allowed for security reasons'],
  ['setTimeout', 'Use of setTimeout() is not allowed for security reasons'],
  ['setInterval', 'Use of setInterval() is not allowed for security reasons'],
  ['fetch', 'Network requests using fetch() are not allowed for security reasons'],
  ['XMLHttpRequest', 'Network requests using XMLHttpRequest are not allowed for security reasons']
])

/**
 * Disallowed property accesses and their reasons
 */
const DISALLOWED_PROPERTIES = new Map([
  ['document.cookie', 'Access to document.cookie is not allowed for security reasons'],
  ['localStorage', 'Access to localStorage is not allowed for security reasons'],
  ['sessionStorage', 'Access to sessionStorage is not allowed for security reasons'],
  ['window.localStorage', 'Access to window.localStorage is not allowed for security reasons'],
  ['window.sessionStorage', 'Access to window.sessionStorage is not allowed for security reasons'],
  ['globalThis.localStorage', 'Access to globalThis.localStorage is not allowed for security reasons'],
  ['globalThis.sessionStorage', 'Access to globalThis.sessionStorage is not allowed for security reasons']
])

/**
 * Validates script content using ts-morph for more accurate analysis
 * @param scriptContent The script content to validate
 * @returns An array of validation errors, empty if valid
 */
export const validateScript = (scriptContent: string): { reason: string }[] => {
  const project = new Project()
  const sourceFile = project.createSourceFile('userCode.tsx', scriptContent)
  const violations: { reason: string }[] = []

  sourceFile.getImportDeclarations().forEach((imp) => {
    const moduleSpecifier = imp.getModuleSpecifierValue()
    if (!ALLOWED_IMPORTS.has(moduleSpecifier)) {
      violations.push({
        reason: `Import from '${moduleSpecifier}' is not allowed. Only imports from approved modules are permitted.`
      })
    }
  })

  sourceFile.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression()
      const expressionText = expression.getText()

      for (const [funcName, reason] of DISALLOWED_FUNCTIONS.entries()) {
        if (expressionText === funcName || expressionText.endsWith(`.${funcName}`)) {
          violations.push({ reason })
          break
        }
      }
    } else if (Node.isNewExpression(node)) {
      const expression = node.getExpression()
      const expressionText = expression.getText()

      if (expressionText === 'XMLHttpRequest') {
        violations.push({
          reason: 'Network requests using XMLHttpRequest are not allowed for security reasons'
        })
      }

      if (expressionText === 'Function') {
        violations.push({
          reason: 'Dynamic function creation is not allowed for security reasons'
        })
      }
    } else if (Node.isPropertyAccessExpression(node)) {
      const fullText = node.getText()

      for (const [propName, reason] of DISALLOWED_PROPERTIES.entries()) {
        if (fullText === propName || fullText.includes(propName)) {
          violations.push({ reason })
          break
        }
      }
    }
  })

  return violations
}

/**
 * Transpiles TypeScript code to JavaScript
 * @param source TypeScript source code
 * @param fileName Original file name (for source maps)
 * @returns Transpiled JavaScript code
 */
export const transpileTypeScript = (source: string, fileName: string): string => {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Node16, // Using Node16 instead of deprecated NodeJs
      esModuleInterop: true,
      sourceMap: true,
      jsx: ts.JsxEmit.React,
      allowJs: true,
      removeComments: false
    },
    fileName
  })

  return result.outputText
}

/**
 * Takes a shallow module import and replace it with a global reference deconstructor
 * Example:
 *
 *      import { x } from '@ir-engine/spatial'
 *            becomes
 *      const { x } = globalThis.__MODULES__.ir.spatial
 *
 *      import { Color } from 'three'
 *            becomes
 *      const { Color } = globalThis.__MODULES__.THREE
 *
 * @param text The script text to process
 * @param importStatement The import statement to replace
 * @param globalName The global name to use in the replacement
 * @returns The processed script text
 */
export const convertImportToGlobal = (text: string, importStatement: string, globalName: string): string => {
  const importRegex = new RegExp(`import\\s+({[^}]+})\\s+from\\s+['"]${importStatement}['"]`, 'g')
  return text.replace(importRegex, `const $1 = globalThis.__MODULES__.${globalName}`)
}
