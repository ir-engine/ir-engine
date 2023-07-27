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

const FriendIcon = ({ color = 'white' }) => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginTop: '11px' }}
    >
      <path
        d="M10.9902 0C5.47023 0 0.990234 4.48 0.990234 10C0.990234 15.52 5.47023 20 10.9902 20C16.5102 20 20.9902 15.52 20.9902 10C20.9902 4.48 16.5102 0 10.9902 0ZM14.6002 6.34C15.6702 6.34 16.5302 7.2 16.5302 8.27C16.5302 9.34 15.6702 10.2 14.6002 10.2C13.5302 10.2 12.6702 9.34 12.6702 8.27C12.6602 7.2 13.5302 6.34 14.6002 6.34ZM8.60023 4.76C9.90024 4.76 10.9602 5.82 10.9602 7.12C10.9602 8.42 9.90024 9.48 8.60023 9.48C7.30023 9.48 6.24023 8.42 6.24023 7.12C6.24023 5.81 7.29024 4.76 8.60023 4.76ZM8.60023 13.89V17.64C6.20023 16.89 4.30023 15.04 3.46023 12.68C4.51023 11.56 7.13023 10.99 8.60023 10.99C9.13023 10.99 9.80023 11.07 10.5002 11.21C8.86023 12.08 8.60023 13.23 8.60023 13.89ZM10.9902 18C10.7202 18 10.4602 17.99 10.2002 17.96V13.89C10.2002 12.47 13.1402 11.76 14.6002 11.76C15.6702 11.76 17.5202 12.15 18.4402 12.91C17.2702 15.88 14.3802 18 10.9902 18Z"
        fill={color}
      />
    </svg>
  )
}

export default FriendIcon
