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

type Props = {
  src: string
}

const EmbedFrame = ({ src }: Props): JSX.Element => {
  return (
    <div className="bg-theme-surface-main relative z-50 h-fit w-[70vw] max-w-2xl overflow-y-auto rounded-2xl px-10 py-6">
      <div className="h-[90vh]">
        {src ? (
          <div className="h-full w-full">
            <iframe
              className="h-full w-full"
              src={src}
              // style="width: 450px; position: fixed; bottom: 0; right: 20px; aspect-ratio: 16/9; background: transparent; z-index: 999999999;"
              frameBorder="0"
              allow="microphone; camera; autoplay; clipboard-write; encrypted-media"
              allowTransparency={true}
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              title="MentorShop Experience"
            ></iframe>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default EmbedFrame
