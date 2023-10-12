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

import React from 'react'

const GroupIcon = ({ color = 'white' }) => {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginTop: '11px' }}
    >
      <path
        d="M14.5 7C15.88 7 16.99 5.88 16.99 4.5C16.99 3.12 15.88 2 14.5 2C13.12 2 12 3.12 12 4.5C12 5.88 13.12 7 14.5 7ZM7 6C8.66 6 9.99 4.66 9.99 3C9.99 1.34 8.66 0 7 0C5.34 0 4 1.34 4 3C4 4.66 5.34 6 7 6ZM14.5 9C12.67 9 9 9.92 9 11.75V14H20V11.75C20 9.92 16.33 9 14.5 9ZM7 8C4.67 8 0 9.17 0 11.5V14H7V11.75C7 10.9 7.33 9.41 9.37 8.28C8.5 8.1 7.66 8 7 8Z"
        fill={color}
      />
    </svg>
  )
}

export default GroupIcon
