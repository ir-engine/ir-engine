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

import packagejson from '../../package.json'

const engineVersion = packagejson.version

export const repo1ManifestJSON = {
  name: '@myorg/my-first-project',
  version: '0.0.0',
  engineVersion
}

export const repo2ManifestJSON = {
  name: '@myorg/my-second-project',
  version: '0.0.0',
  engineVersion
}

export const getRepoManifestJson1 = () => ({
  name: 'manifest.json',
  path: 'manifest.json',
  sha: '307456741f75499a57fac1145ce2c75112ddbf57',
  size: 321,
  url: 'https://api.github.com/repos/MyOrg/my-first-project/contents/manifest.json?ref=dev',
  html_url: 'https://github.com/MyOrg/my-first-project/blob/dev/manifest.json',
  git_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/blobs/307456741f75499a57fac1145ce2c75112ddbf57',
  download_url: 'https://raw.githubusercontent.com/MyOrg/my-first-project/dev/manifest.json',
  type: 'file',
  content: Buffer.from(JSON.stringify(repo1ManifestJSON)).toString('base64'),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/MyOrg/my-first-project/contents/manifest.json?ref=dev',
    git: 'https://api.github.com/repos/MyOrg/my-first-project/git/blobs/307456741f75499a57fac1145ce2c75112ddbf57',
    html: 'https://github.com/MyOrg/my-first-project/blob/dev/manifest.json'
  }
})

export const getRepoManifestJson2 = () => ({
  name: 'manifest.json',
  path: 'manifest.json',
  sha: '76f00e5fd3035ed32f21eecf87a6503547752767',
  size: 1163,
  url: 'https://api.github.com/repos/MyOrg/my-second-project/contents/manifest.json?ref=master',
  html_url: 'https://github.com/MyOrg/my-second-project/blob/master/manifest.json',
  git_url: 'https://api.github.com/repos/MyOrg/my-second-project/git/blobs/76f00e5fd3035ed32f21eecf87a6503547752767',
  download_url: 'https://raw.githubusercontent.com/MyOrg/my-second-project/master/manifest.json',
  type: 'file',
  content: Buffer.from(JSON.stringify(repo2ManifestJSON)).toString('base64'),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/MyOrg/my-second-project/contents/manifest.json?ref=master',
    git: 'https://api.github.com/repos/MyOrg/my-second-project/git/blobs/76f00e5fd3035ed32f21eecf87a6503547752767',
    html: 'https://github.com/MyOrg/my-second-project/blob/master/manifest.json'
  }
})

export const getTestRepoCommit = () => ({
  sha: '9157dba017ede5585beacffe765260143c9d6212',
  node_id: 'C_kwDOJOElGdoAKDkxNTdkYmEwMTdlZGU1NTg1YmVhY2ZmZTc2NTI2MDE0M2M5ZDYyMTI',
  commit: {
    author: {
      name: 'HexaField',
      email: 'fakeemail@github.com',
      date: '2023-10-13T02:23:53Z'
    },
    committer: {
      name: 'HexaField',
      email: 'fakeemail@github.com',
      date: '2023-10-13T02:23:53Z'
    },
    message: 'update camera far',
    tree: {
      sha: '5f6e43c2e7fa309acb18c5ad6809c68346fe119a',
      url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees/5f6e43c2e7fa309acb18c5ad6809c68346fe119a'
    },
    url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits/9157dba017ede5585beacffe765260143c9d6212',
    comment_count: 0,
    verification: {
      verified: false,
      reason: 'unsigned',
      signature: null,
      payload: null
    }
  },
  url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/9157dba017ede5585beacffe765260143c9d6212',
  html_url: 'https://github.com/MyOrg/my-first-project/commit/9157dba017ede5585beacffe765260143c9d6212',
  comments_url:
    'https://api.github.com/repos/MyOrg/my-first-project/commits/9157dba017ede5585beacffe765260143c9d6212/comments',
  author: {
    login: 'HexaField',
    id: 10372036,
    node_id: 'MDQ6VXNlcjEwMzcyMDM2',
    avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/HexaField',
    html_url: 'https://github.com/HexaField',
    followers_url: 'https://api.github.com/users/HexaField/followers',
    following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
    gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
    organizations_url: 'https://api.github.com/users/HexaField/orgs',
    repos_url: 'https://api.github.com/users/HexaField/repos',
    events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
    received_events_url: 'https://api.github.com/users/HexaField/received_events',
    type: 'User',
    site_admin: false
  },
  committer: {
    login: 'HexaField',
    id: 10372036,
    node_id: 'MDQ6VXNlcjEwMzcyMDM2',
    avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/HexaField',
    html_url: 'https://github.com/HexaField',
    followers_url: 'https://api.github.com/users/HexaField/followers',
    following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
    gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
    organizations_url: 'https://api.github.com/users/HexaField/orgs',
    repos_url: 'https://api.github.com/users/HexaField/repos',
    events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
    received_events_url: 'https://api.github.com/users/HexaField/received_events',
    type: 'User',
    site_admin: false
  },
  parents: [
    {
      sha: 'bd8e415420052222a7953d149b1d5ba9153bc84a',
      url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/bd8e415420052222a7953d149b1d5ba9153bc84a',
      html_url: 'https://github.com/MyOrg/my-first-project/commit/bd8e415420052222a7953d149b1d5ba9153bc84a'
    }
  ],
  stats: {
    total: 2,
    additions: 1,
    deletions: 1
  },
  files: [
    {
      sha: 'ee2f1886524e0041238dbb712f85a3301dd7265c',
      filename: 'village.gltf',
      status: 'modified',
      additions: 1,
      deletions: 1,
      changes: 2,
      blob_url: 'https://github.com/MyOrg/my-first-project/blob/9157dba017ede5585beacffe765260143c9d6212/village.gltf',
      raw_url: 'https://github.com/MyOrg/my-first-project/raw/9157dba017ede5585beacffe765260143c9d6212/village.gltf',
      contents_url:
        'https://api.github.com/repos/MyOrg/my-first-project/contents/village.gltf?ref=9157dba017ede5585beacffe765260143c9d6212',
      patch:
        '@@ -381,7 +381,7 @@\n           "props": {\n             "color": 16777215,\n             "intensity": 1,\n-            "cameraFar": 2000,\n+            "cameraFar": 200,\n             "castShadow": true,\n             "shadowBias": -0.000005,\n             "shadowRadius": 1,'
    }
  ]
})

export const getTestRepoData = () => ({
  id: 618734873,
  node_id: 'R_kgDOJOElGQ',
  name: 'my-first-project',
  full_name: 'MyOrg/my-first-project',
  private: false,
  owner: {
    login: 'MyOrg',
    id: 107153800,
    node_id: 'O_kgDOBmMJiA',
    avatar_url: 'https://avatars.githubusercontent.com/u/107153800?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/MyOrg',
    html_url: 'https://github.com/MyOrg',
    followers_url: 'https://api.github.com/users/MyOrg/followers',
    following_url: 'https://api.github.com/users/MyOrg/following{/other_user}',
    gists_url: 'https://api.github.com/users/MyOrg/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/MyOrg/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/MyOrg/subscriptions',
    organizations_url: 'https://api.github.com/users/MyOrg/orgs',
    repos_url: 'https://api.github.com/users/MyOrg/repos',
    events_url: 'https://api.github.com/users/MyOrg/events{/privacy}',
    received_events_url: 'https://api.github.com/users/MyOrg/received_events',
    type: 'Organization',
    site_admin: false
  },
  html_url: 'https://github.com/MyOrg/my-first-project',
  description: null,
  fork: false,
  url: 'https://api.github.com/repos/MyOrg/my-first-project',
  forks_url: 'https://api.github.com/repos/MyOrg/my-first-project/forks',
  keys_url: 'https://api.github.com/repos/MyOrg/my-first-project/keys{/key_id}',
  collaborators_url: 'https://api.github.com/repos/MyOrg/my-first-project/collaborators{/collaborator}',
  teams_url: 'https://api.github.com/repos/MyOrg/my-first-project/teams',
  hooks_url: 'https://api.github.com/repos/MyOrg/my-first-project/hooks',
  issue_events_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues/events{/number}',
  events_url: 'https://api.github.com/repos/MyOrg/my-first-project/events',
  assignees_url: 'https://api.github.com/repos/MyOrg/my-first-project/assignees{/user}',
  branches_url: 'https://api.github.com/repos/MyOrg/my-first-project/branches{/branch}',
  tags_url: 'https://api.github.com/repos/MyOrg/my-first-project/tags',
  blobs_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/blobs{/sha}',
  git_tags_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/tags{/sha}',
  git_refs_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/refs{/sha}',
  trees_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees{/sha}',
  statuses_url: 'https://api.github.com/repos/MyOrg/my-first-project/statuses/{sha}',
  languages_url: 'https://api.github.com/repos/MyOrg/my-first-project/languages',
  stargazers_url: 'https://api.github.com/repos/MyOrg/my-first-project/stargazers',
  contributors_url: 'https://api.github.com/repos/MyOrg/my-first-project/contributors',
  subscribers_url: 'https://api.github.com/repos/MyOrg/my-first-project/subscribers',
  subscription_url: 'https://api.github.com/repos/MyOrg/my-first-project/subscription',
  commits_url: 'https://api.github.com/repos/MyOrg/my-first-project/commits{/sha}',
  git_commits_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits{/sha}',
  comments_url: 'https://api.github.com/repos/MyOrg/my-first-project/comments{/number}',
  issue_comment_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues/comments{/number}',
  contents_url: 'https://api.github.com/repos/MyOrg/my-first-project/contents/{+path}',
  compare_url: 'https://api.github.com/repos/MyOrg/my-first-project/compare/{base}...{head}',
  merges_url: 'https://api.github.com/repos/MyOrg/my-first-project/merges',
  archive_url: 'https://api.github.com/repos/MyOrg/my-first-project/{archive_format}{/ref}',
  downloads_url: 'https://api.github.com/repos/MyOrg/my-first-project/downloads',
  issues_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues{/number}',
  pulls_url: 'https://api.github.com/repos/MyOrg/my-first-project/pulls{/number}',
  milestones_url: 'https://api.github.com/repos/MyOrg/my-first-project/milestones{/number}',
  notifications_url: 'https://api.github.com/repos/MyOrg/my-first-project/notifications{?since,all,participating}',
  labels_url: 'https://api.github.com/repos/MyOrg/my-first-project/labels{/name}',
  releases_url: 'https://api.github.com/repos/MyOrg/my-first-project/releases{/id}',
  deployments_url: 'https://api.github.com/repos/MyOrg/my-first-project/deployments',
  created_at: '2023-03-25T07:31:50Z',
  updated_at: '2023-04-13T10:21:48Z',
  pushed_at: '2023-11-30T20:48:23Z',
  git_url: 'git://github.com/MyOrg/my-first-project.git',
  ssh_url: 'git@github.com:MyOrg/my-first-project.git',
  clone_url: 'https://github.com/MyOrg/my-first-project.git',
  svn_url: 'https://github.com/MyOrg/my-first-project',
  homepage: null,
  size: 352,
  stargazers_count: 1,
  watchers_count: 1,
  language: 'JavaScript',
  has_issues: true,
  has_projects: true,
  has_downloads: true,
  has_wiki: true,
  has_pages: false,
  has_discussions: false,
  forks_count: 4,
  mirror_url: null,
  archived: false,
  disabled: false,
  open_issues_count: 1,
  license: {
    key: 'other',
    name: 'Other',
    spdx_id: 'NOASSERTION',
    url: null,
    node_id: 'MDc6TGljZW5zZTA='
  },
  allow_forking: true,
  is_template: false,
  web_commit_signoff_required: false,
  topics: [],
  visibility: 'public',
  forks: 4,
  open_issues: 1,
  watchers: 1,
  default_branch: 'dev',
  temp_clone_token: null,
  organization: {
    login: 'MyOrg',
    id: 107153800,
    node_id: 'O_kgDOBmMJiA',
    avatar_url: 'https://avatars.githubusercontent.com/u/107153800?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/MyOrg',
    html_url: 'https://github.com/MyOrg',
    followers_url: 'https://api.github.com/users/MyOrg/followers',
    following_url: 'https://api.github.com/users/MyOrg/following{/other_user}',
    gists_url: 'https://api.github.com/users/MyOrg/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/MyOrg/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/MyOrg/subscriptions',
    organizations_url: 'https://api.github.com/users/MyOrg/orgs',
    repos_url: 'https://api.github.com/users/MyOrg/repos',
    events_url: 'https://api.github.com/users/MyOrg/events{/privacy}',
    received_events_url: 'https://api.github.com/users/MyOrg/received_events',
    type: 'Organization',
    site_admin: false
  },
  network_count: 4,
  subscribers_count: 4
})

export const getTestRepoCommits = () => [
  {
    sha: '9157dba017ede5585beacffe765260143c9d6212',
    node_id: 'C_kwDOJOElGdoAKDkxNTdkYmEwMTdlZGU1NTg1YmVhY2ZmZTc2NTI2MDE0M2M5ZDYyMTI',
    commit: {
      author: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-10-13T02:23:53Z'
      },
      committer: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-10-13T02:23:53Z'
      },
      message: 'update camera far',
      tree: {
        sha: '5f6e43c2e7fa309acb18c5ad6809c68346fe119a',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees/5f6e43c2e7fa309acb18c5ad6809c68346fe119a'
      },
      url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits/9157dba017ede5585beacffe765260143c9d6212',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null
      }
    },
    url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/9157dba017ede5585beacffe765260143c9d6212',
    html_url: 'https://github.com/MyOrg/my-first-project/commit/9157dba017ede5585beacffe765260143c9d6212',
    comments_url:
      'https://api.github.com/repos/MyOrg/my-first-project/commits/9157dba017ede5585beacffe765260143c9d6212/comments',
    author: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    committer: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    parents: [
      {
        sha: 'bd8e415420052222a7953d149b1d5ba9153bc84a',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/bd8e415420052222a7953d149b1d5ba9153bc84a',
        html_url: 'https://github.com/MyOrg/my-first-project/commit/bd8e415420052222a7953d149b1d5ba9153bc84a'
      }
    ]
  },
  {
    sha: 'bd8e415420052222a7953d149b1d5ba9153bc84a',
    node_id: 'C_kwDOJOElGdoAKGJkOGU0MTU0MjAwNTIyMjJhNzk1M2QxNDliMWQ1YmE5MTUzYmM4NGE',
    commit: {
      author: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-10-03T10:40:09Z'
      },
      committer: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-10-03T10:40:09Z'
      },
      message: 'update thumbnail and envmap',
      tree: {
        sha: '36134179a75fea30bd3889ef669c7b7273daf713',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees/36134179a75fea30bd3889ef669c7b7273daf713'
      },
      url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits/bd8e415420052222a7953d149b1d5ba9153bc84a',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null
      }
    },
    url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/bd8e415420052222a7953d149b1d5ba9153bc84a',
    html_url: 'https://github.com/MyOrg/my-first-project/commit/bd8e415420052222a7953d149b1d5ba9153bc84a',
    comments_url:
      'https://api.github.com/repos/MyOrg/my-first-project/commits/bd8e415420052222a7953d149b1d5ba9153bc84a/comments',
    author: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    committer: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    parents: [
      {
        sha: 'f5e0f7175f4332bfefd358488e6bc61868efd90a',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/f5e0f7175f4332bfefd358488e6bc61868efd90a',
        html_url: 'https://github.com/MyOrg/my-first-project/commit/f5e0f7175f4332bfefd358488e6bc61868efd90a'
      }
    ]
  },
  {
    sha: 'f5e0f7175f4332bfefd358488e6bc61868efd90a',
    node_id: 'C_kwDOJOElGdoAKGY1ZTBmNzE3NWY0MzMyYmZlZmQzNTg0ODhlNmJjNjE4NjhlZmQ5MGE',
    commit: {
      author: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-09-25T05:06:03Z'
      },
      committer: {
        name: 'HexaField',
        email: 'fakeemail@github.com',
        date: '2023-09-25T05:06:03Z'
      },
      message: 'resave and update village',
      tree: {
        sha: 'e1b3e3e016968998d9acc4f50db7c0344b8128b9',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees/e1b3e3e016968998d9acc4f50db7c0344b8128b9'
      },
      url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits/f5e0f7175f4332bfefd358488e6bc61868efd90a',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null
      }
    },
    url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/f5e0f7175f4332bfefd358488e6bc61868efd90a',
    html_url: 'https://github.com/MyOrg/my-first-project/commit/f5e0f7175f4332bfefd358488e6bc61868efd90a',
    comments_url:
      'https://api.github.com/repos/MyOrg/my-first-project/commits/f5e0f7175f4332bfefd358488e6bc61868efd90a/comments',
    author: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    committer: {
      login: 'HexaField',
      id: 10372036,
      node_id: 'MDQ6VXNlcjEwMzcyMDM2',
      avatar_url: 'https://avatars.githubusercontent.com/u/10372036?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/HexaField',
      html_url: 'https://github.com/HexaField',
      followers_url: 'https://api.github.com/users/HexaField/followers',
      following_url: 'https://api.github.com/users/HexaField/following{/other_user}',
      gists_url: 'https://api.github.com/users/HexaField/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/HexaField/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/HexaField/subscriptions',
      organizations_url: 'https://api.github.com/users/HexaField/orgs',
      repos_url: 'https://api.github.com/users/HexaField/repos',
      events_url: 'https://api.github.com/users/HexaField/events{/privacy}',
      received_events_url: 'https://api.github.com/users/HexaField/received_events',
      type: 'User',
      site_admin: false
    },
    parents: [
      {
        sha: 'df334f5fd49eb554add117840559838c968d5be7',
        url: 'https://api.github.com/repos/MyOrg/my-first-project/commits/df334f5fd49eb554add117840559838c968d5be7',
        html_url: 'https://github.com/MyOrg/my-first-project/commit/df334f5fd49eb554add117840559838c968d5be7'
      }
    ]
  }
]

export const getTestAuthenticatedUser = (username: string) => ({
  login: username,
  id: 1,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  gravatar_id: '',
  url: `https://api.github.com/users/${username}`,
  html_url: `https://github.com/${username}`,
  followers_url: `https://api.github.com/users/${username}/followers`,
  following_url: `https://api.github.com/users/${username}/following{/other_user}`,
  gists_url: `https://api.github.com/users/${username}/gists{/gist_id}`,
  starred_url: `https://api.github.com/users/${username}/starred{/owner}{/repo}`,
  subscriptions_url: `https://api.github.com/users/${username}/subscriptions`,
  organizations_url: `https://api.github.com/users/${username}/orgs`,
  repos_url: `https://api.github.com/users/${username}/repos`,
  events_url: `https://api.github.com/users/${username}/events{/privacy}`,
  received_events_url: `https://api.github.com/users/${username}/received_events`,
  type: 'User',
  site_admin: false,
  name: `Test User ${username}`,
  company: 'GitHub',
  blog: 'https://github.com/blog',
  location: 'San Francisco',
  email: 'octocat@github.com',
  hireable: false,
  bio: 'There once was...',
  twitter_username: 'monatheoctocat',
  public_repos: 2,
  public_gists: 1,
  followers: 20,
  following: 0,
  created_at: '2008-01-14T04:33:35Z',
  updated_at: '2008-01-14T04:33:35Z',
  private_gists: 81,
  total_private_repos: 100,
  owned_private_repos: 100,
  disk_usage: 10000,
  collaborators: 8,
  two_factor_authentication: true,
  plan: {
    name: 'Medium',
    space: 400,
    private_repos: 20,
    collaborators: 0
  }
})

export const getTestUserRepos = () => [
  {
    id: 501798315,
    node_id: 'R_kgDOHejVqw',
    name: '.github',
    full_name: 'MyOrg/.github',
    private: false,
    owner: {
      login: 'MyOrg',
      id: 107153800,
      node_id: 'O_kgDOBmMJiA',
      avatar_url: 'https://avatars.githubusercontent.com/u/107153800?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/MyOrg',
      html_url: 'https://github.com/MyOrg',
      followers_url: 'https://api.github.com/users/MyOrg/followers',
      following_url: 'https://api.github.com/users/MyOrg/following{/other_user}',
      gists_url: 'https://api.github.com/users/MyOrg/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/MyOrg/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/MyOrg/subscriptions',
      organizations_url: 'https://api.github.com/users/MyOrg/orgs',
      repos_url: 'https://api.github.com/users/MyOrg/repos',
      events_url: 'https://api.github.com/users/MyOrg/events{/privacy}',
      received_events_url: 'https://api.github.com/users/MyOrg/received_events',
      type: 'Organization',
      site_admin: false
    },
    html_url: 'https://github.com/MyOrg/.github',
    description: null,
    fork: false,
    url: 'https://api.github.com/repos/MyOrg/.github',
    forks_url: 'https://api.github.com/repos/MyOrg/.github/forks',
    keys_url: 'https://api.github.com/repos/MyOrg/.github/keys{/key_id}',
    collaborators_url: 'https://api.github.com/repos/MyOrg/.github/collaborators{/collaborator}',
    teams_url: 'https://api.github.com/repos/MyOrg/.github/teams',
    hooks_url: 'https://api.github.com/repos/MyOrg/.github/hooks',
    issue_events_url: 'https://api.github.com/repos/MyOrg/.github/issues/events{/number}',
    events_url: 'https://api.github.com/repos/MyOrg/.github/events',
    assignees_url: 'https://api.github.com/repos/MyOrg/.github/assignees{/user}',
    branches_url: 'https://api.github.com/repos/MyOrg/.github/branches{/branch}',
    tags_url: 'https://api.github.com/repos/MyOrg/.github/tags',
    blobs_url: 'https://api.github.com/repos/MyOrg/.github/git/blobs{/sha}',
    git_tags_url: 'https://api.github.com/repos/MyOrg/.github/git/tags{/sha}',
    git_refs_url: 'https://api.github.com/repos/MyOrg/.github/git/refs{/sha}',
    trees_url: 'https://api.github.com/repos/MyOrg/.github/git/trees{/sha}',
    statuses_url: 'https://api.github.com/repos/MyOrg/.github/statuses/{sha}',
    languages_url: 'https://api.github.com/repos/MyOrg/.github/languages',
    stargazers_url: 'https://api.github.com/repos/MyOrg/.github/stargazers',
    contributors_url: 'https://api.github.com/repos/MyOrg/.github/contributors',
    subscribers_url: 'https://api.github.com/repos/MyOrg/.github/subscribers',
    subscription_url: 'https://api.github.com/repos/MyOrg/.github/subscription',
    commits_url: 'https://api.github.com/repos/MyOrg/.github/commits{/sha}',
    git_commits_url: 'https://api.github.com/repos/MyOrg/.github/git/commits{/sha}',
    comments_url: 'https://api.github.com/repos/MyOrg/.github/comments{/number}',
    issue_comment_url: 'https://api.github.com/repos/MyOrg/.github/issues/comments{/number}',
    contents_url: 'https://api.github.com/repos/MyOrg/.github/contents/{+path}',
    compare_url: 'https://api.github.com/repos/MyOrg/.github/compare/{base}...{head}',
    merges_url: 'https://api.github.com/repos/MyOrg/.github/merges',
    archive_url: 'https://api.github.com/repos/MyOrg/.github/{archive_format}{/ref}',
    downloads_url: 'https://api.github.com/repos/MyOrg/.github/downloads',
    issues_url: 'https://api.github.com/repos/MyOrg/.github/issues{/number}',
    pulls_url: 'https://api.github.com/repos/MyOrg/.github/pulls{/number}',
    milestones_url: 'https://api.github.com/repos/MyOrg/.github/milestones{/number}',
    notifications_url: 'https://api.github.com/repos/MyOrg/.github/notifications{?since,all,participating}',
    labels_url: 'https://api.github.com/repos/MyOrg/.github/labels{/name}',
    releases_url: 'https://api.github.com/repos/MyOrg/.github/releases{/id}',
    deployments_url: 'https://api.github.com/repos/MyOrg/.github/deployments',
    created_at: '2022-06-09T20:24:08Z',
    updated_at: '2022-06-09T20:24:08Z',
    pushed_at: '2023-11-01T07:08:18Z',
    git_url: 'git://github.com/MyOrg/.github.git',
    ssh_url: 'git@github.com:MyOrg/.github.git',
    clone_url: 'https://github.com/MyOrg/.github.git',
    svn_url: 'https://github.com/MyOrg/.github',
    homepage: null,
    size: 12,
    stargazers_count: 0,
    watchers_count: 0,
    language: null,
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    has_discussions: false,
    forks_count: 0,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    license: null,
    allow_forking: true,
    is_template: false,
    web_commit_signoff_required: false,
    topics: ['engine'],
    visibility: 'public',
    forks: 0,
    open_issues: 0,
    watchers: 0,
    default_branch: 'main',
    permissions: {
      admin: true
    }
  },
  {
    id: 618734873,
    node_id: 'R_kgDOJOElGQ',
    name: 'my-first-project',
    full_name: 'MyOrg/my-first-project',
    private: false,
    owner: {
      login: 'MyOrg',
      id: 107153800,
      node_id: 'O_kgDOBmMJiA',
      avatar_url: 'https://avatars.githubusercontent.com/u/107153800?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/MyOrg',
      html_url: 'https://github.com/MyOrg',
      followers_url: 'https://api.github.com/users/MyOrg/followers',
      following_url: 'https://api.github.com/users/MyOrg/following{/other_user}',
      gists_url: 'https://api.github.com/users/MyOrg/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/MyOrg/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/MyOrg/subscriptions',
      organizations_url: 'https://api.github.com/users/MyOrg/orgs',
      repos_url: 'https://api.github.com/users/MyOrg/repos',
      events_url: 'https://api.github.com/users/MyOrg/events{/privacy}',
      received_events_url: 'https://api.github.com/users/MyOrg/received_events',
      type: 'Organization',
      site_admin: false
    },
    html_url: 'https://github.com/MyOrg/my-first-project',
    description: null,
    fork: false,
    url: 'https://api.github.com/repos/MyOrg/my-first-project',
    forks_url: 'https://api.github.com/repos/MyOrg/my-first-project/forks',
    keys_url: 'https://api.github.com/repos/MyOrg/my-first-project/keys{/key_id}',
    collaborators_url: 'https://api.github.com/repos/MyOrg/my-first-project/collaborators{/collaborator}',
    teams_url: 'https://api.github.com/repos/MyOrg/my-first-project/teams',
    hooks_url: 'https://api.github.com/repos/MyOrg/my-first-project/hooks',
    issue_events_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues/events{/number}',
    events_url: 'https://api.github.com/repos/MyOrg/my-first-project/events',
    assignees_url: 'https://api.github.com/repos/MyOrg/my-first-project/assignees{/user}',
    branches_url: 'https://api.github.com/repos/MyOrg/my-first-project/branches{/branch}',
    tags_url: 'https://api.github.com/repos/MyOrg/my-first-project/tags',
    blobs_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/blobs{/sha}',
    git_tags_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/tags{/sha}',
    git_refs_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/refs{/sha}',
    trees_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/trees{/sha}',
    statuses_url: 'https://api.github.com/repos/MyOrg/my-first-project/statuses/{sha}',
    languages_url: 'https://api.github.com/repos/MyOrg/my-first-project/languages',
    stargazers_url: 'https://api.github.com/repos/MyOrg/my-first-project/stargazers',
    contributors_url: 'https://api.github.com/repos/MyOrg/my-first-project/contributors',
    subscribers_url: 'https://api.github.com/repos/MyOrg/my-first-project/subscribers',
    subscription_url: 'https://api.github.com/repos/MyOrg/my-first-project/subscription',
    commits_url: 'https://api.github.com/repos/MyOrg/my-first-project/commits{/sha}',
    git_commits_url: 'https://api.github.com/repos/MyOrg/my-first-project/git/commits{/sha}',
    comments_url: 'https://api.github.com/repos/MyOrg/my-first-project/comments{/number}',
    issue_comment_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues/comments{/number}',
    contents_url: 'https://api.github.com/repos/MyOrg/my-first-project/contents/{+path}',
    compare_url: 'https://api.github.com/repos/MyOrg/my-first-project/compare/{base}...{head}',
    merges_url: 'https://api.github.com/repos/MyOrg/my-first-project/merges',
    archive_url: 'https://api.github.com/repos/MyOrg/my-first-project/{archive_format}{/ref}',
    downloads_url: 'https://api.github.com/repos/MyOrg/my-first-project/downloads',
    issues_url: 'https://api.github.com/repos/MyOrg/my-first-project/issues{/number}',
    pulls_url: 'https://api.github.com/repos/MyOrg/my-first-project/pulls{/number}',
    milestones_url: 'https://api.github.com/repos/MyOrg/my-first-project/milestones{/number}',
    notifications_url: 'https://api.github.com/repos/MyOrg/my-first-project/notifications{?since,all,participating}',
    labels_url: 'https://api.github.com/repos/MyOrg/my-first-project/labels{/name}',
    releases_url: 'https://api.github.com/repos/MyOrg/my-first-project/releases{/id}',
    deployments_url: 'https://api.github.com/repos/MyOrg/my-first-project/deployments',
    created_at: '2023-03-25T07:31:50Z',
    updated_at: '2023-04-13T10:21:48Z',
    pushed_at: '2023-11-30T20:48:23Z',
    git_url: 'git://github.com/MyOrg/my-first-project.git',
    ssh_url: 'git@github.com:MyOrg/my-first-project.git',
    clone_url: 'https://github.com/MyOrg/my-first-project.git',
    svn_url: 'https://github.com/MyOrg/my-first-project',
    homepage: null,
    size: 352,
    stargazers_count: 1,
    watchers_count: 1,
    language: 'JavaScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    has_discussions: false,
    forks_count: 4,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 1,
    license: {
      key: 'other',
      name: 'Other',
      spdx_id: 'NOASSERTION',
      url: null,
      node_id: 'MDc6TGljZW5zZTA='
    },
    allow_forking: true,
    is_template: false,
    web_commit_signoff_required: false,
    topics: [],
    visibility: 'public',
    forks: 4,
    open_issues: 1,
    watchers: 1,
    default_branch: 'dev',
    temp_clone_token: null,
    organization: {
      login: 'MyOrg',
      id: 107153800,
      node_id: 'O_kgDOBmMJiA',
      avatar_url: 'https://avatars.githubusercontent.com/u/107153800?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/MyOrg',
      html_url: 'https://github.com/MyOrg',
      followers_url: 'https://api.github.com/users/MyOrg/followers',
      following_url: 'https://api.github.com/users/MyOrg/following{/other_user}',
      gists_url: 'https://api.github.com/users/MyOrg/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/MyOrg/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/MyOrg/subscriptions',
      organizations_url: 'https://api.github.com/users/MyOrg/orgs',
      repos_url: 'https://api.github.com/users/MyOrg/repos',
      events_url: 'https://api.github.com/users/MyOrg/events{/privacy}',
      received_events_url: 'https://api.github.com/users/MyOrg/received_events',
      type: 'Organization',
      site_admin: false
    },
    network_count: 4,
    subscribers_count: 4,
    permissions: {
      push: true,
      admin: false,
      maintain: true
    }
  }
]
