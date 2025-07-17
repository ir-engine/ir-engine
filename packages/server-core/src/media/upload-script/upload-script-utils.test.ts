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
import { validateScript } from './upload-script-utils'

describe('upload-script-utils with ts-morph', () => {
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

    it('should detect disallowed imports', () => {
      const codeWithDisallowedImport = `
        import { readFile } from 'fs';
        import { Vector3 } from 'three';

        const position = new Vector3(0, 1, 0);
        console.log('Position:', position);
      `
      const validationErrors = validateScript(codeWithDisallowedImport)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain("Import from 'fs'")
    })

    it('should detect fetch usage', () => {
      const codeWithFetch = `
        import { Vector3 } from 'three';

        // This should be blocked
        async function getData() {
          const response = await fetch('https://example.com/api');
          return await response.json();
        }
      `
      const validationErrors = validateScript(codeWithFetch)
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

    it('should detect setTimeout usage', () => {
      const codeWithSetTimeout = `
        import { Vector3 } from 'three';

        // This should be blocked
        setTimeout(() => {
          console.log('Delayed execution');
        }, 1000);
      `
      const validationErrors = validateScript(codeWithSetTimeout)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('setTimeout')
    })

    it('should detect setInterval usage', () => {
      const codeWithSetInterval = `
        import { Vector3 } from 'three';

        // This should be blocked
        setInterval(() => {
          console.log('Repeated execution');
        }, 1000);
      `
      const validationErrors = validateScript(codeWithSetInterval)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('setInterval')
    })

    it('should detect dynamic Function constructor usage', () => {
      const codeWithDynamicFunction = `
        import { Vector3 } from 'three';

        // This should be blocked
        const dynamicFunc = new Function('a', 'b', 'return a + b');
      `
      const validationErrors = validateScript(codeWithDynamicFunction)
      expect(validationErrors.length).toBeGreaterThan(0)
      expect(validationErrors[0].reason).toContain('function creation')
    })

    it('should detect multiple disallowed features', () => {
      const codeWithMultipleIssues = `
        import { Vector3 } from 'three';
        import { readFile } from 'fs';

        // These should all be blocked
        fetch('https://example.com/api');
        localStorage.setItem('key', 'value');
        eval('console.log("dangerous")');
      `
      const validationErrors = validateScript(codeWithMultipleIssues)
      expect(validationErrors.length).toBeGreaterThan(1)

      const reasons = validationErrors.map((error) => error.reason)
      expect(reasons.some((reason) => reason.includes('fetch'))).toBe(true)
      expect(reasons.some((reason) => reason.includes('localStorage'))).toBe(true)
      expect(reasons.some((reason) => reason.includes('eval'))).toBe(true)
      expect(reasons.some((reason) => reason.includes("Import from 'fs'"))).toBe(true)
    })
  })
})
