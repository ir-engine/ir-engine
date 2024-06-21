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
        // BRAND COLORS
        'magenta': {
          100: '#ECDAE6',
          200: '#DAB4CD',
          300: '#C78FB4',
          400: '#B4699B',
          500: '#A24482',
          600: '#823668',
          700: '#61294E',
          800: '#411B34',
          900: '#200E1A'
        },
        'blue': {
          100: '#D7DFEF',
          200: '#AFBEDF',
          300: '#879ECF',
          400: '#5F7DBF',
          500: '#375DAF',
          600: '#2C4ABC',
          700: '#213869',
          800: '#162546',
          900: '#0B1323'
        },
        'purple': {
          100: '#E0D4FD',
          200: '#C1A9FB',
          300: '#A27EF9',
          400: '#8353F7',
          500: '#6428F5',
          600: '#5020C4',
          700: '#3C1893',
          800: '#281062',
          900: '#140831'
        },
        // SUPPORTING COLORS
        'green': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3DO',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        },
        'yellow': {
          50: '#FEFC38',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12'
        },
        'red' : {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337'
        },
        // NEUTRALS
        'neutral': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#4B4C4E',
          600: '#3B3B3B',
          700: '#2E2E2E',
          800: '#242424',
          850: '#1C1C1C',
          900: '#141414',
          950: '#080808'
        }
      }
    }
  },
  safelist: [
    ...Array.from({ length: 101 }, (_, i) => `via-[${i}%]`),
    ...Array.from({ length: 101 }, (_, i) => `to-[${i}%]`)
  ]
}
