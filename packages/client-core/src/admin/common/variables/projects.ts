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

export interface ProjectColumn {
  id:
    | 'name'
    | 'projectVersion'
    | 'commitSHA'
    | 'commitDate'
    | 'update'
    | 'invalidate'
    | 'view'
    | 'action'
    | 'link'
    | 'push'
    | 'projectPermissions'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
  sortable: boolean
}

export const projectsColumns: ProjectColumn[] = [
  { id: 'name', label: 'Name', minWidth: 65, sortable: true },
  { id: 'projectVersion', label: 'Version', minWidth: 65, sortable: false },
  { id: 'commitSHA', label: 'Commit SHA', minWidth: 100, sortable: false },
  { id: 'commitDate', label: 'Commit Date', minWidth: 100, sortable: true },
  { id: 'update', label: 'Update', minWidth: 65, align: 'center', sortable: false },
  { id: 'push', label: 'Push to GitHub', minWidth: 65, align: 'center', sortable: false },
  { id: 'link', label: 'GitHub Repo Link', minWidth: 65, align: 'center', sortable: false },
  { id: 'projectPermissions', label: 'User Access', minWidth: 65, align: 'center', sortable: false },
  { id: 'invalidate', label: 'Invalidate Cache', minWidth: 65, align: 'center', sortable: false },
  { id: 'view', label: 'View Project Files', minWidth: 65, align: 'center', sortable: false },
  {
    id: 'action',
    label: 'Remove',
    minWidth: 65,
    align: 'center',
    sortable: false
  }
]
