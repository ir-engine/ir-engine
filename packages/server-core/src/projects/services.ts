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

import BuilderInfo from './builder-info/builder-info'
import ProjectBranches from './project-branches/project-branches'
import ProjectBuild from './project-build/project-build'
import ProjectBuilderTags from './project-builder-tags/project-builder-tags'
import ProjectCheckSourceDestinationMatch from './project-check-source-destination-match/project-check-source-destination-match'
import ProjectCheckUnfetchedCommit from './project-check-unfetched-commit/project-check-unfetched-commit'
import ProjectCommits from './project-commits/project-commits'
import ProjectDestinationCheck from './project-destination-check/project-destination-check'
import ProjectGithubPush from './project-github-push/project-github-push'
import ProjectInvalidate from './project-invalidate/project-invalidate'
import ProjectPermission from './project-permission/project-permission'
import Project from './project/project'
import Projects from './projects/projects'
import Scene from './scene/scene.service'

export default [
  BuilderInfo,
  Project,
  Projects,
  ProjectBuild,
  ProjectInvalidate,
  ProjectPermission,
  ProjectGithubPush,
  ProjectBuilderTags,
  ProjectBranches,
  ProjectCommits,
  ProjectDestinationCheck,
  ProjectCheckUnfetchedCommit,
  ProjectCheckSourceDestinationMatch,
  Scene
]
