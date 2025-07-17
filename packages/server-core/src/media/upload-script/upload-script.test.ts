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

import { describe, expect, it } from 'vitest'
import { convertImportToGlobal, transpileTypeScript, validateScript } from './upload-script-utils'

describe('upload-script-utils', () => {
  describe('validateScript', () => {
    it('should pass valid JavaScript code', () => {
      const validCode = `
        import { Vector3 } from 'three';
        import { Entity } from '@ir-engine/ecs';

        const position = new Vector3(0, 1, 0);
        console.log('Position:', position);

        function init() {
          return 'Initialized';
        }

        export { init };
      `
      const validationErrors = validateScript(validCode)
      expect(validationErrors.length).toBe(0)
    })

    it('should detect fetch API usage', () => {
      const codeWithFetch = `
        import { Vector3 } from 'three';

        // This should be blocked
        fetch('https://example.com/api').then(response => {
          console.log(response);
        });
      `
      const validationErrors = validateScript(codeWithFetch)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('fetch')
    })

    it('should detect window.fetch API usage', () => {
      const codeWithWindowFetch = `
        import { Vector3 } from 'three';

        // This should be blocked
        window.fetch('https://example.com/api').then(response => {
          console.log(response);
        });
      `
      const validationErrors = validateScript(codeWithWindowFetch)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('fetch')
    })

    it('should detect XMLHttpRequest usage', () => {
      const codeWithXHR = `
        import { Vector3 } from 'three';

        // This should be blocked
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://example.com/api');
        xhr.send();
      `
      const validationErrors = validateScript(codeWithXHR)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('XMLHttpRequest')
    })

    it('should detect eval usage', () => {
      const codeWithEval = `
        import { Vector3 } from 'three';

        // This should be blocked
        eval('console.log("This is dangerous")');
      `
      const validationErrors = validateScript(codeWithEval)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('eval')
    })

    it('should detect document.cookie access', () => {
      const codeWithCookie = `
        import { Vector3 } from 'three';

        // This should be blocked
        console.log(document.cookie);
        document.cookie = "test=value";
      `
      const validationErrors = validateScript(codeWithCookie)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('cookie')
    })

    it('should detect localStorage usage', () => {
      const codeWithLocalStorage = `
        import { Vector3 } from 'three';

        // This should be blocked
        localStorage.setItem('key', 'value');
      `
      const validationErrors = validateScript(codeWithLocalStorage)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('localStorage')
    })

    it('should detect sessionStorage usage', () => {
      const codeWithSessionStorage = `
        import { Vector3 } from 'three';

        // This should be blocked
        sessionStorage.setItem('key', 'value');
      `
      const validationErrors = validateScript(codeWithSessionStorage)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('sessionStorage')
    })

    it('should detect dynamic Function constructor usage', () => {
      const codeWithDynamicFunction = `
        import { Vector3 } from 'three';

        // This should be blocked
        const dynamicFunc = new Function('a', 'b', 'return a + b');
      `
      const validationErrors = validateScript(codeWithDynamicFunction)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('Dynamic function')
    })

    it('should detect multiple disallowed features', () => {
      const codeWithMultipleIssues = `
        import { Vector3 } from 'three';

        // These should all be blocked
        fetch('https://example.com/api');
        localStorage.setItem('key', 'value');
        eval('console.log("dangerous")');
      `
      const validationErrors = validateScript(codeWithMultipleIssues)
      expect(validationErrors.length).toBe(3)

      const reasons = validationErrors.map((error) => error.reason)
      expect(reasons.some((reason) => reason.includes('fetch'))).toBe(true)
      expect(reasons.some((reason) => reason.includes('localStorage'))).toBe(true)
      expect(reasons.some((reason) => reason.includes('eval'))).toBe(true)
    })
  })

  describe('transpileTypeScript', () => {
    it('should transpile TypeScript to JavaScript', () => {
      const tsCode = `
        interface Position {
          x: number;
          y: number;
          z: number;
        }

        const position: Position = { x: 0, y: 1, z: 0 };
        console.log('Position:', position);

        function init(): string {
          return 'Initialized';
        }

        export { init, Position };
      `

      const jsCode = transpileTypeScript(tsCode, 'test.ts')

      // TypeScript features should be removed
      expect(jsCode).not.toContain('interface Position')
      expect(jsCode).not.toContain(': Position')
      expect(jsCode).not.toContain(': string')

      // But the core functionality should remain
      expect(jsCode).toContain('const position')
      expect(jsCode).toContain('function init')
      expect(jsCode).toContain("return 'Initialized'")
      expect(jsCode).toContain('export { init')
    })

    it('should handle TypeScript with advanced features', () => {
      const advancedTsCode = `
        type Vector = {
          x: number;
          y: number;
          z: number;
        };

        enum Direction {
          Up,
          Down,
          Left,
          Right
        }

        class Entity {
          private position: Vector;

          constructor(position: Vector) {
            this.position = position;
          }

          move(direction: Direction): void {
            switch(direction) {
              case Direction.Up:
                this.position.y += 1;
                break;
              case Direction.Down:
                this.position.y -= 1;
                break;
            }
          }

          getPosition(): Vector {
            return { ...this.position };
          }
        }

        const entity = new Entity({ x: 0, y: 0, z: 0 });
        entity.move(Direction.Up);
        console.log(entity.getPosition());
      `

      const jsCode = transpileTypeScript(advancedTsCode, 'advanced.ts')

      // TypeScript features should be removed
      expect(jsCode).not.toContain('type Vector')
      expect(jsCode).not.toContain(': Vector')
      expect(jsCode).not.toContain(': void')

      // But the core functionality should remain
      expect(jsCode).toContain('class Entity')
      expect(jsCode).toContain('constructor')
      expect(jsCode).toContain('Direction')
      expect(jsCode).toContain('entity.move')
    })

    it('should handle TypeScript with generics', () => {
      const genericsTsCode = `
        interface Container<T> {
          value: T;
          getValue(): T;
        }

        class Box<T> implements Container<T> {
          constructor(public value: T) {}

          getValue(): T {
            return this.value;
          }
        }

        const numberBox = new Box<number>(42);
        const stringBox = new Box<string>('Hello');

        console.log(numberBox.getValue() + 10);
        console.log(stringBox.getValue() + ' World');
      `

      const jsCode = transpileTypeScript(genericsTsCode, 'generics.ts')

      // TypeScript features should be removed
      expect(jsCode).not.toContain('<T>')
      expect(jsCode).not.toContain('implements Container<T>')
      expect(jsCode).not.toContain(': T')

      // But the core functionality should remain
      expect(jsCode).toContain('class Box')
      expect(jsCode).toContain('constructor')
      expect(jsCode).toContain('getValue')
      expect(jsCode).toContain('new Box(42)')
      expect(jsCode).toContain("new Box('Hello')")
    })

    it('should handle TypeScript with async/await', () => {
      const asyncTsCode = `
        interface Response {
          data: string;
        }

        async function fetchData(): Promise<Response> {
          // Simulate async operation
          return new Promise<Response>((resolve) => {
            setTimeout(() => {
              resolve({ data: 'Async data' });
            }, 100);
          });
        }

        async function processData(): Promise<string> {
          const response = await fetchData();
          return response.data.toUpperCase();
        }

        // Usage
        processData().then(result => {
          console.log(result);
        });
      `

      const jsCode = transpileTypeScript(asyncTsCode, 'async.ts')

      // TypeScript features should be removed
      expect(jsCode).not.toContain(': Promise<Response>')
      expect(jsCode).not.toContain('Promise<Response>')
      expect(jsCode).not.toContain(': Promise<string>')

      // But the core functionality should remain
      expect(jsCode).toContain('async function fetchData')
      expect(jsCode).toContain('async function processData')
      expect(jsCode).toContain('const response = await fetchData')
      expect(jsCode).toContain('return response.data.toUpperCase()')
    })

    it('should handle TypeScript with decorators', () => {
      const decoratorsTsCode = `
        // Simple decorator
        function log(target: any, key: string) {
          const originalMethod = target[key];

          target[key] = function(...args: any[]) {
            console.log(\`Calling \${key} with \${args.length} arguments\`);
            return originalMethod.apply(this, args);
          };
        }

        class Calculator {
          @log
          add(a: number, b: number): number {
            return a + b;
          }
        }

        const calc = new Calculator();
        console.log(calc.add(5, 3));
      `

      const jsCode = transpileTypeScript(decoratorsTsCode, 'decorators.ts')

      // Core functionality should be preserved
      expect(jsCode).toContain('class Calculator')
      expect(jsCode).toContain('add(')
      expect(jsCode).toContain('return a + b')
      expect(jsCode).toContain('new Calculator()')
    })

    it('should handle TSX/JSX syntax', () => {
      const tsxCode = `
        import { Component } from 'react';

        interface ButtonProps {
          label: string;
          onClick: () => void;
        }

        class Button extends Component<ButtonProps> {
          render() {
            return (
              <button onClick={this.props.onClick}>
                {this.props.label}
              </button>
            );
          }
        }

        function App() {
          return (
            <div className="app">
              <h1>Hello World</h1>
              <Button
                label="Click Me"
                onClick={() => console.log('Button clicked')}
              />
            </div>
          );
        }

        export default App;
      `

      const jsCode = transpileTypeScript(tsxCode, 'component.tsx')

      // JSX should be transformed to React.createElement calls
      expect(jsCode).not.toContain('<button')
      expect(jsCode).not.toContain('<div')
      expect(jsCode).not.toContain('<h1')

      // Core functionality should be preserved
      expect(jsCode).toContain('React.createElement')
      expect(jsCode).toContain('class Button extends')
      expect(jsCode).toContain('function App')
      expect(jsCode).toContain('export default App')
    })
  })

  describe('convertImportToGlobal', () => {
    it('should convert three.js imports to global references', () => {
      const code = `import { Vector3, Matrix4 } from 'three';`
      const converted = convertImportToGlobal(code, 'three', 'THREE')
      expect(converted).toBe(`const { Vector3, Matrix4 } = globalThis.__MODULES__.THREE;`)
    })

    it('should convert IR engine imports to global references', () => {
      const code = `import { Entity, Component } from '@ir-engine/ecs';`
      const converted = convertImportToGlobal(code, '@ir-engine/ecs', 'IR.ECS')
      expect(converted).toBe(`const { Entity, Component } = globalThis.__MODULES__.IR.ECS;`)
    })

    it('should handle multiple imports', () => {
      const code = `
        import { Vector3 } from 'three';
        import { Entity } from '@ir-engine/ecs';

        const position = new Vector3(0, 1, 0);
        const entity = new Entity();
      `

      let converted = code
      converted = convertImportToGlobal(converted, 'three', 'THREE')
      converted = convertImportToGlobal(converted, '@ir-engine/ecs', 'IR.ECS')

      expect(converted).toContain(`const { Vector3 } = globalThis.__MODULES__.THREE`)
      expect(converted).toContain(`const { Entity } = globalThis.__MODULES__.IR.ECS`)
      expect(converted).not.toContain(`import { Vector3 } from 'three'`)
      expect(converted).not.toContain(`import { Entity } from '@ir-engine/ecs'`)
    })

    it('should handle imports with whitespace variations', () => {
      const variations = [
        `import {Vector3} from 'three';`,
        `import { Vector3 } from 'three';`,
        `import {   Vector3,   Matrix4   } from 'three';`,
        `import {Vector3,Matrix4} from 'three';`
      ]

      for (const code of variations) {
        const converted = convertImportToGlobal(code, 'three', 'THREE')
        expect(converted).toContain(`globalThis.__MODULES__.THREE`)
        expect(converted).not.toContain(`import`)
      }
    })

    it('should only convert exact import matches', () => {
      const code = `
        import { Vector3 } from 'three';
        import { Entity } from '@ir-engine/ecs';
        import { Something } from 'three-extra';
        import { OtherThing } from '@ir-engine/ecs-utils';
      `

      let converted = code
      converted = convertImportToGlobal(converted, 'three', 'THREE')
      converted = convertImportToGlobal(converted, '@ir-engine/ecs', 'IR.ECS')

      // These should be converted
      expect(converted).toContain(`const { Vector3 } = globalThis.__MODULES__.THREE`)
      expect(converted).toContain(`const { Entity } = globalThis.__MODULES__.IR.ECS`)

      // These should remain as imports
      expect(converted).toContain(`import { Something } from 'three-extra'`)
      expect(converted).toContain(`import { OtherThing } from '@ir-engine/ecs-utils'`)
    })

    it('should handle imports with single and double quotes', () => {
      const singleQuotes = `import { Vector3 } from 'three';`
      const doubleQuotes = `import { Vector3 } from "three";`

      const convertedSingle = convertImportToGlobal(singleQuotes, 'three', 'THREE')
      const convertedDouble = convertImportToGlobal(doubleQuotes, 'three', 'THREE')

      expect(convertedSingle).toContain(`globalThis.__MODULES__.THREE`)
      expect(convertedDouble).toContain(`globalThis.__MODULES__.THREE`)
    })

    it('should handle imports with multiple items', () => {
      const code = `import { Vector3, Matrix4, Quaternion, Euler, Box3 } from 'three';`

      const converted = convertImportToGlobal(code, 'three', 'THREE')

      expect(converted).toBe(`const { Vector3, Matrix4, Quaternion, Euler, Box3 } = globalThis.__MODULES__.THREE;`)
    })

    it('should handle imports in TypeScript files', () => {
      const tsCode = `
        import { Vector3 } from 'three';

        interface Position {
          x: number;
          y: number;
          z: number;
        }

        const position: Position = new Vector3(0, 1, 0);
      `

      const converted = convertImportToGlobal(tsCode, 'three', 'THREE')

      expect(converted).toContain(`const { Vector3 } = globalThis.__MODULES__.THREE`)
      expect(converted).not.toContain(`import { Vector3 } from 'three'`)
      expect(converted).toContain(`interface Position`)
    })
  })
})
