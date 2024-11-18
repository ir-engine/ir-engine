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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
import PhoneInput from './index'

export default {
  title: 'Components/Tailwind/PhoneInput',
  component: PhoneInput
}

const Renderer = (args: any) => {
  const countryDetails = [
    {
      flag: '🇺🇸',
      name: 'United States',
      dialCode: '+1',
      countryCode: 'US'
    },
    {
      flag: '🇨🇦',
      name: 'Canada',
      dialCode: '+1',
      countryCode: 'CA'
    },
    {
      flag: '🇲🇽',
      name: 'Mexico',
      dialCode: '+52',
      countryCode: 'MX'
    },
    {
      flag: '🇧🇷',
      name: 'Brazil',
      dialCode: '+55',
      countryCode: 'BR'
    },
    {
      flag: '🇦🇷',
      name: 'Argentina',
      dialCode: '+54',
      countryCode: 'AR'
    },
    {
      flag: '🇨🇱',
      name: 'Chile',
      dialCode: '+56',
      countryCode: 'CL'
    },
    {
      flag: '🇵🇪',
      name: 'Peru',
      dialCode: '+51',
      countryCode: 'PE'
    },
    {
      flag: '🇨🇴',
      name: 'Colombia',
      dialCode: '+57',
      countryCode: 'CO'
    },
    {
      flag: '🇻🇪',
      name: 'Venezuela',
      dialCode: '+58',
      countryCode: 'VE'
    },
    {
      flag: '🇪🇨',
      name: 'Ecuador',
      dialCode: '+593',
      countryCode: 'EC'
    },
    {
      flag: '🇵🇾',
      name: 'Paraguay',
      dialCode: '+595',
      countryCode: 'PY'
    },
    {
      flag: '🇮🇳',
      name: 'India',
      dialCode: '+91',
      countryCode: 'IN'
    }
  ]

  const [value, setValue] = useState({
    countryIndex: -1,
    phoneNumber: ''
  })

  return (
    <PhoneInput
      countries={countryDetails}
      value={value}
      onChange={(v) => {
        setValue(v)
      }}
    />
  )
}

export const Default = Renderer.bind({})
