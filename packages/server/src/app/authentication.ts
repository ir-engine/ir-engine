import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService } from '@feathersjs/authentication';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { Application } from '../declarations';
import GithubStrategy from '../strategies/github';
import GoogleStrategy from '../strategies/google';
import FacebookStrategy from '../strategies/facebook';
import { MyLocalStrategy } from '../strategies/local';
import { MyJwtStrategy } from '../strategies/jwt';

declare module '../declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new MyJwtStrategy());
  authentication.register('local', new MyLocalStrategy());
  authentication.register('google', new GoogleStrategy());
  authentication.register('facebook', new FacebookStrategy());
  authentication.register('github', new GithubStrategy());

  app.use('/authentication', authentication);

  app.configure(expressOauth());
};
