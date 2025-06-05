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
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    '../client/**/*.{ts,tsx}',
    '../client-core/**/*.{ts,tsx}',
    '../common/**/*.{ts,tsx}',
    '../engine/**/*.{ts,tsx}',
    '../editor/**/*.{ts,tsx}',
    '../projects/projects/**/*.{ts,tsx}',
    '../ui/**/*.{ts,tsx}'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  important: true, // important in prod is must be
  theme: {
    extend: {
      screens: {
        xsh: { raw: '(min-height: 500px)' },
        smh: { raw: '(min-height: 700px)' },
        mdh: { raw: '(min-height: 900px)' },
        lgh: { raw: '(min-height: 1100px)' },
        xlh: { raw: '(min-height: 1300px)' },

        'max-sm': { raw: `not all and (min-width: ${defaultTheme.screens.sm})` },
        'max-md': { raw: `not all and (min-width: ${defaultTheme.screens.md})` },
        'max-lg': { raw: `not all and (min-width: ${defaultTheme.screens.lg})` },
        'max-xl': { raw: `not all and (min-width: ${defaultTheme.screens.xl})` },
        'max-2xl': { raw: `not all and (min-width: ${defaultTheme.screens['2xl']})` }
      },
      height: {
        'table-size-xs': 'calc(100vh - 436px)',
        'table-size-sm': 'calc(100vh - 418px)',
        'table-size-md': 'calc(100vh - 402px)',
        'table-size-lg': 'calc(100vh - 386px)',
        'table-size-xl': 'calc(100vh - 318px)',
        'table-size-full': '100%'
      },
      gradientColorStops: {
        ...Array.from({ length: 101 }, (_, i) => i).reduce((acc, curr) => {
          acc[curr] = `${curr}%`
          return acc
        }, {})
      },
      colors: {
        /* Surface Colors */
        'surface-0': 'var(--surface-0)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-4': 'var(--surface-4)',
        'surface-error': 'var(--surface-error)',
        'surface-warning': 'var(--surface-warning)',
        'surface-success': 'var(--surface-success)',

        /* Surface Outline */
        'surface-outline-1-1': 'var(--surface-outline-1-1)',
        'surface-outline-2-1': 'var(--surface-outline-2-1)',
        'surface-outline-3-1': 'var(--surface-outline-3-1)',
        'surface-outline-4-1': 'var(--surface-outline-4-1)',
        'surface-outline-5-1': 'var(--surface-outline-5-1)',

        /* UI Elements / Default */
        'ui-background': 'var(--ui-background)',
        'ui-outline': 'var(--ui-outline)',
        'ui-primary': 'var(--ui-primary)',
        'ui-secondary': 'var(--ui-secondary)',
        'ui-tertiary': 'var(--ui-tertiary)',
        'ui-quadrary': 'var(--ui-quadrary)',
        'ui-error': 'var(--ui-error)',
        'ui-warning': 'var(--ui-warning)',
        'ui-success': 'var(--ui-success)',

        /* UI Elements / Hover */
        'ui-hover-background': 'var(--ui-hover-background)',
        'ui-hover-outline': 'var(--ui-hover-outline)',
        'ui-hover-primary': 'var(--ui-hover-primary)',
        'ui-hover-secondary': 'var(--ui-hover-secondary)',
        'ui-hover-tertiary': 'var(--ui-hover-tertiary)',
        'ui-hover-quadrary': 'var(--ui-hover-quadrary)',
        'ui-hover-error': 'var(--ui-hover-error)',
        'ui-hover-warning': 'var(--ui-hover-warning)',
        'ui-hover-success': 'var(--ui-hover-success)',

        /* UI Elements / Select */
        'ui-select-background': 'var(--ui-select-background)',
        'ui-select-outline': 'var(--ui-select-outline)',
        'ui-select-primary': 'var(--ui-select-primary)',
        'ui-select-secondary': 'var(--ui-select-secondary)',
        'ui-select-tertiary': 'var(--ui-select-tertiary)',
        'ui-select-quadrary': 'var(--ui-select-quadrary)',
        'ui-select-error': 'var(--ui-select-error)',
        'ui-select-warning': 'var(--ui-select-warning)',
        'ui-select-success': 'var(--ui-select-success)',

        /* UI Elements / Inactive */
        'ui-inactive-background': 'var(--ui-inactive-background)',
        'ui-inactive-outline': 'var(--ui-inactive-outline)',
        'ui-inactive-primary': 'var(--ui-inactive-primary)',
        'ui-inactive-secondary': 'var(--ui-inactive-secondary)',
        'ui-inactive-tertiary': 'var(--ui-inactive-tertiary)',
        'ui-inactive-quadrary': 'var(--ui-inactive-quadrary)',
        'ui-inactive-error': 'var(--ui-inactive-error)',
        'ui-inactive-warning': 'var(--ui-inactive-warning)',
        'ui-inactive-success': 'var(--ui-inactive-success)',

        /* Text Colors */
        'text-primary-button': 'var(--text-primary-button)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-inactive': 'var(--text-inactive)',
        'text-link': 'var(--text-link)',
        'text-error': 'var(--text-error)',
        'text-warning': 'var(--text-warning)',
        'text-success': 'var(--text-success)',

        /* Chart Colors */
        'chart-100': 'var(--chart-100)',
        'chart-200': 'var(--chart-200)',
        'chart-300': 'var(--chart-300)',
        'chart-400': 'var(--chart-400)',
        'chart-500': 'var(--chart-500)',
        'chart-600': 'var(--chart-600)',
        'chart-700': 'var(--chart-700)',
        'chart-800': 'var(--chart-800)',
        'chart-900': 'var(--chart-900)',
        'chart-1000': 'var(--chart-1000)',
        'chart-1100': 'var(--chart-1100)',
        'chart-1200': 'var(--chart-1200)',
        'chart-1300': 'var(--chart-1300)',

        'primary-blue': 'hsla(211, 47%, 53%, 1)',
        'inactive-input': 'rgba(0, 0, 0, 0.14)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        figtree: ['Figtree', 'sans-serif'],
        campton: ['Campton', 'sans-serif'],
        'dm-sans': ['"DM Sans"', 'sans-serif']
      },
      keyframes: {
        twinkling: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' }
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        twinkling: 'twinkling 5s alternate infinite',
        slideIn: 'slideIn 0.3s ease-out forwards'
      }
    }
  },
  safelist: [
    ...Array.from({ length: 101 }, (_, i) => `via-[${i}%]`),
    ...Array.from({ length: 101 }, (_, i) => `to-[${i}%]`)
  ]
}
