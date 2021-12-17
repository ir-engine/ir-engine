import { Application } from '../../../declarations'
import { GitHubAppService } from './githubapp.class'

declare module '../../../declarations' {
  interface ServiceTypes {
    'github-app': GitHubAppService
  }
}

export default (app: Application): any => {
  const githubAppService = new GitHubAppService({}, app)
  app.use('github-app', githubAppService)
}
