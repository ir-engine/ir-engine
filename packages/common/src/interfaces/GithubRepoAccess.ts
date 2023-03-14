export interface GithubRepoAccess {
  id: string
  repo: string
  identityProviderId: string
  hasWriteAccess: boolean
}

export const GithubRepoAccess: GithubRepoAccess = {
  id: '',
  repo: '',
  identityProviderId: '',
  hasWriteAccess: false
}
