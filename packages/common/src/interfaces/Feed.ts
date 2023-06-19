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

import { CreatorShort } from './Creator'

export interface FeedShort {
  id: string
  previewUrl: string
  viewsCount: number
}

export interface Feed extends FeedShort {
  creator: CreatorShort
  videoUrl: string
  previewUrl: string
  fires: number
  likes: number
  title: string
  description: string
  isFired?: boolean
  isLiked?: boolean
  isBookmarked?: boolean
  previewType?: string
  videoType?: string
}

export interface FeedDatabaseRow {
  id: string
  title: string
  description: string
  featured: boolean
  videoUrl: string
  previewUrl: string
  viewsCount: number
  createdAt: string
  updatedAt: string
  authorId: string
}

export interface FeedResult {
  data: Feed[]
  total: number
  limit: number
  skip: number
}
