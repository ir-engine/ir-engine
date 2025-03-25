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

import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorisedPage = (props) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#43484F',
        color: '#f1f1f1',
        position: 'relative',
        height: '100vh'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '35%',
          transform: 'translate(-50%, 50%)',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          lineHeight: '1.4'
        }}
      >
        <p
          style={{
            fontFamily: 'inherit',
            color: '#c9c9c9',
            fontSize: '18px',
            fontWeight: 'normal',
            marginTop: '0',
            marginBottom: '40px'
          }}
        >
          {props.message}
        </p>
        <Link style={{ textDecoration: 'none' }} to="/">
          <button
            style={{
              height: '50px',
              margin: 'auto 5px',
              width: '100%',
              background: 'rgb(58, 65, 73)',
              color: '#f1f1f1 !important',
              border: 'solid #f1f1f1 2px'
            }}
          >
            Home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default UnauthorisedPage
