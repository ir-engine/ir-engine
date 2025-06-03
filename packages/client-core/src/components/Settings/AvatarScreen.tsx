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

import React from 'react'

import { MenuItem } from './MenuItem'
import { Section } from './Section'

interface AvatarScreenProps {
  navigateTo: (screen: string) => void
  onClose?: () => void
}

const AvatarScreen: React.FC<AvatarScreenProps> = ({ navigateTo }) => {
  return (
    <div className="space-y-4">
      {/* Avatar Display Section */}
      <Section>
        <div className="relative aspect-square max-h-[250px] w-full overflow-hidden rounded-xl">
          {/* Gradient background similar to the image */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #E8F4FD 0%, #B8E6B8 50%, #87CEEB 100%)'
            }}
          />

          {/* Avatar placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-48 w-32 flex-col items-center justify-end">
              {/* Head */}
              <div
                className="mb-2 h-12 w-12 rounded-full"
                style={{
                  background: 'linear-gradient(145deg, #D4A574, #C19660)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              />

              {/* Body */}
              <div
                className="mb-1 h-16 w-20 rounded-t-lg"
                style={{
                  background: 'linear-gradient(145deg, #2C2C2C, #1A1A1A)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />

              {/* Legs */}
              <div className="flex space-x-1">
                <div
                  className="h-12 w-8 rounded-b-lg"
                  style={{
                    background: 'linear-gradient(145deg, #2C2C2C, #1A1A1A)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
                <div
                  className="h-12 w-8 rounded-b-lg"
                  style={{
                    background: 'linear-gradient(145deg, #2C2C2C, #1A1A1A)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </div>

              {/* Feet */}
              <div className="mt-1 flex space-x-2">
                <div
                  className="h-3 w-6 rounded-full"
                  style={{
                    background: 'linear-gradient(145deg, #8B7355, #6B5B47)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
                <div
                  className="h-3 w-6 rounded-full"
                  style={{
                    background: 'linear-gradient(145deg, #8B7355, #6B5B47)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Action Buttons */}
      <Section>
        <MenuItem
          label="Edit Avatar"
          onClick={() => {
            // Navigate to edit avatar screen (placeholder)
            console.log('Navigate to Edit Avatar')
          }}
          hasChevron
        />
        <div className="h-px bg-white/10"></div>
        <MenuItem
          label="Upload New Avatar"
          onClick={() => {
            // Handle upload action (placeholder)
            console.log('Upload New Avatar')
          }}
          hasChevron
        />
      </Section>
    </div>
  )
}

export default AvatarScreen
