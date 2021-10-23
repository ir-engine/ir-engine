import matches from '../matches'
import { unknown } from '../parsers/SimpleParsers'
import { parserAsTypescriptString } from './typescriptTypes'
const { execSync } = require('child_process')

import * as ts from 'typescript'
import { tuple } from '../parsers'

// This was pulled from the transpile in the typescript compiler
function tsCompile(input: string, transpileOptions: ts.TranspileOptions = {}) {
  const diagnostics: ts.Diagnostic[] = []

  const options: ts.CompilerOptions = transpileOptions.compilerOptions ?? {}
  // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
  options.suppressOutputPathCheck = true

  // Filename can be non-ts file.
  options.allowNonTsExtensions = true

  // if jsx is specified then treat file as .tsx
  const inputFileName =
    transpileOptions.fileName ||
    (transpileOptions.compilerOptions && transpileOptions.compilerOptions.jsx ? 'module.tsx' : 'module.ts')
  const sourceFile = ts.createSourceFile(inputFileName, input, options.target!) // TODO: GH#18217
  if (transpileOptions.moduleName) {
    sourceFile.moduleName = transpileOptions.moduleName
  }

  const newLine = '\n'

  // Output
  let outputText: string | undefined
  let sourceMapText: string | undefined

  // Create a compilerHost object to allow the compiler to read and write files
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName) => sourceFile,
    writeFile: (name, text) => {
      outputText = text
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => '',
    getNewLine: () => newLine,
    fileExists: (fileName): boolean => fileName === inputFileName,
    readFile: () => '',
    directoryExists: () => true,
    getDirectories: () => []
  }

  const program = ts.createProgram([inputFileName], options, compilerHost)

  if (transpileOptions.reportDiagnostics) {
    addRange(/*to*/ diagnostics, /*from*/ program.getSyntacticDiagnostics(sourceFile))
    addRange(/*to*/ diagnostics, /*from*/ program.getOptionsDiagnostics())
    addRange(/*to*/ diagnostics, /*from*/ program.getSemanticDiagnostics())
  }
  // Emit
  program.emit(
    /*targetSourceFile*/ undefined,
    /*writeFile*/ undefined,
    /*cancellationToken*/ undefined,
    /*emitOnlyDtsFiles*/ undefined,
    transpileOptions.transformers
  )
  return { outputText, diagnostics, sourceMapText }
}

function addRange(to: Array<unknown>, from: ReadonlyArray<unknown> | Array<unknown>) {
  for (const item of from) {
    to.push(item)
  }
}
describe('typescriptType Transformer', () => {
  const {
    string,
    number,
    boolean,
    array,
    arrayOf,
    literal,
    literals,
    object,
    any,
    every,
    some,
    partial,
    shape,
    isFunction,
    nill,
    dictionary
  } = matches
  it('zero', () => {
    expect(
      parserAsTypescriptString(
        shape({
          literals: literals('a', true, 5, 6.0),
          string: string,
          number: number,
          boolean: boolean,
          array: array,
          arrayOfString5: arrayOf(every(string, literal('5'))),
          object: object,
          any: any,
          unknown: unknown,
          partial: partial({
            someValue: string
          }),
          some: some(
            number.refine(function isEven(n): n is number {
              return n % 2 === 0
            }),
            string
          ),
          every: every(
            number.refine(function isEven(n): n is number {
              return n % 2 === 0
            }, 'test'),
            number
          ),
          named: string.name('Date'),
          function: isFunction,
          nill: nill,
          maybeLiterals: literals('a', true, 5, 6.0).optional(),
          maybeString: string.optional(),
          maybeNumber: number.optional(),
          maybeBoolean: boolean.optional(),
          maybeArray: array.optional(),
          mapped: number.map((x) => x + 1),
          default: number.defaultTo(5),
          dictionary: dictionary([literals('a', 5), number], [string, string]),
          tuple: tuple(string, number)
        })
      )
    ).toMatchInlineSnapshot(
      `"{\\"literals\\":(\\"a\\" | true | 5 | 6), \\"string\\":string, \\"number\\":number, \\"boolean\\":boolean, \\"array\\":Array<unknown>, \\"arrayOfString5\\":(Array<unknown> & Array<(string & (\\"5\\"))>), \\"object\\":object, \\"any\\":any, \\"unknown\\":unknown, \\"partial\\":Partial<{\\"someValue\\":string}>, \\"some\\":(number | string), \\"every\\":(number & number), \\"named\\":Date, \\"function\\":Function, \\"nill\\":null, \\"maybeLiterals\\":null | (\\"a\\" | true | 5 | 6), \\"maybeString\\":null | string, \\"maybeNumber\\":null | number, \\"maybeBoolean\\":null | boolean, \\"maybeArray\\":null | Array<unknown>, \\"mapped\\":number, \\"default\\":null | null | number, \\"dictionary\\":(object & {[keyT0 in (\\"a\\" | 5)]:number}&{[keyT1 in string]:string}), \\"tuple\\":[string, number]}"`
    )
  })
  it('Should be able to compile output', () => {
    let compileCode = parserAsTypescriptString(
      shape({
        literals: literals('a', true, 5, 6.0),
        string: string,
        number: number,
        boolean: boolean,
        array: array,
        arrayOfString5: arrayOf(every(string, literal('5'))),
        object: object,
        any: any,
        unknown: unknown,
        partial: partial({
          someValue: string
        }),
        some: some(
          number.refine(function isEven(n): n is number {
            return n % 2 === 0
          }),
          string
        ),
        every: every(
          number.refine(function isEven(n): n is number {
            return n % 2 === 0
          }, 'test'),
          number
        ),
        named: string.name('Date'),
        function: isFunction,
        nill: nill,
        maybeLiterals: literals('a', true, 5, 6.0).optional(),
        maybeString: string.optional(),
        maybeNumber: number.optional(),
        maybeBoolean: boolean.optional(),
        maybeArray: array.optional(),
        mapped: number.map((x) => x + 1),
        default: number.defaultTo(5),
        dictionary: dictionary([literals('a'), number], [string, number])
      })
    )
    const diagnostics = tsCompile(
      /* ts */ `{
            type Test = ${compileCode};
            // @ts-expect-error
            const test: Test = {};
            const test2: Test = {
                literals: 'a',
                string: '',
                number: 0,
                boolean: false,
                array: [],
                arrayOfString5: ['5'],
                object: {},
                any: null,
                unknown: undefined,
                partial: {
                    someValue: '',
                },
                some: 2,
                every: 2,
                named: new Date(),
                function: () => {},
                nill: null,
                maybeLiterals: null,
                maybeString: null,
                maybeNumber: null,
                maybeBoolean: null,
                maybeArray: null,
                mapped: 2,
                default: 5,
                dictionary: {
                    a: 5,
                }
            }
            // @ts-expect-error Literal Testing
            const test3: Test = {...test2, literals: 'b'}
            // @ts-expect-error string testing
            const test3: Test = {...test2, string: 5}
            // @ts-expect-error string testing
            const test3: Test = {...test2, number: '0'}
            // @ts-expect-error boolean testing
            const test3: Test = {...test2, boolean: 0}
            // @ts-expect-error array of
            const test3: Test = {...test2, arrayOfString5: [5]}
            // @ts-expect-error Mybe Literal Testing
            const test3: Test = {...test2, maybeLiterals: 'b'}
            // @ts-expect-error Named Testing
            const test3: Test = {...test2, named: new Moment()}
            // @ts-expect-error Dictionary Testing
            const test3: Test = {...test2, dictionary: {}}
        }`,
      {
        reportDiagnostics: true,
        compilerOptions: {
          strict: true,
          target: ts.ScriptTarget.ES2019,
          module: ts.ModuleKind.ESNext,
          declaration: true,
          noImplicitAny: true
        }
      }
    ).diagnostics.filter(function ignoreMissingTypes(x) {
      return x.code !== 2304
    })
    const firstError = diagnostics[0]
    if (firstError) {
      throw new Error(
        typeof firstError.messageText === 'string' ? firstError.messageText : firstError.messageText.messageText
      )
    }
  })
  it('Testing nothing passed', () => {
    expect(parserAsTypescriptString()).toMatchInlineSnapshot(`"unknown"`)
  })
})
