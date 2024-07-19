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

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['../**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  important: true, // important in prod is must be
  theme: {
    extend: {
      gradientColorStops: {
        ...Array.from({ length: 101 }, (_, i) => i).reduce((acc, curr) => {
          acc[curr] = `${curr}%`;
          return acc;
        }, {})
      },
      backgroundImage: {
        'gradient-onboarding': 'linear-gradient(180deg, #0A0A0A 0%, #262626 100%)',
        'text-gradient-onboarding': 'linear-gradient(275deg, #4195FB 4.98%, #4E9CFB 61.64%, #A5CDFD 97.96%)',
        'button-gradient-onboarding': 'linear-gradient(96deg, #375DAF 57.63%, #6481C1 100%)'
      },
      textColor: {
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          highlight: 'var(--text-highlight)',
          iconGreen: 'var(--icon-green)',
          iconRed: 'var(--icon-red)'
        }
      },
      backgroundColor: {
        theme: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          highlight: 'var(--bg-highlight)',
          surfaceInput: 'var(--bg-surface-input)',
          'surface-main': 'var(--bg-surface-main)',
          'table-secondary': 'var(--bg-table-secondary)',
          'blue-secondary': 'var(--bg-blue-secondary)',
          bannerInformative: 'var(--bg-banner-informative)',
          tagGreen: 'var(--bg-tag-green)',
          tagLime: 'var(--bg-tag-lime)',
          tagRed: 'var(--bg-tag-red)',
          tagYellow: 'var(--bg-tag-yellow)'
        }
      },
      borderColor: {
        theme: {
          primary: 'var(--border-primary)'
        }
      },
      colors: {
        'blue-primary': '#375DAF',
        'pink-primary': '#A24482',
        'purple-primary': '#8261D2',
      }
    }
  },
  safelist: [
    ...Array.from({ length: 101 }, (_, i) => `via-[${i}%]`),
    ...Array.from({ length: 101 }, (_, i) => `to-[${i}%]`)
  ]
}
