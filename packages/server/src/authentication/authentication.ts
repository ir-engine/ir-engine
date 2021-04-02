import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService } from '@feathersjs/authentication';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { Application } from '../declarations';
import GithubStrategy from '../../../server-core/src/strategies/github';
import GoogleStrategy from '../../../server-core/src/strategies/google';
import FacebookStrategy from '../../../server-core/src/strategies/facebook';
import LinkedInStrategy from "../../../server-core/src/strategies/linkedin";
import { MyLocalStrategy } from '../../../server-core/src/strategies/local';
import { MyJwtStrategy } from '../../../server-core/src/strategies/jwt';
import authenticationDoc from '../authentication/authentication.doc';
import TwitterStrategy from '../../../server-core/src/strategies/twitter';

declare module '../declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const authentication = new AuthenticationService(app as any);
  authentication['docs'] = authenticationDoc;

  authentication.register('jwt', new MyJwtStrategy());
  authentication.register('local', new MyLocalStrategy());
  authentication.register('google', new GoogleStrategy());
  authentication.register('facebook', new FacebookStrategy());
  authentication.register('github', new GithubStrategy());
  authentication.register('linkedin2', new LinkedInStrategy());
  authentication.register('twitter', new TwitterStrategy());

  app.use('/authentication', authentication);

  app.configure(expressOauth()); 
};
