# XRChat Client

This is the front end for the XRChat client

To run
```
yarn install
yarn build
yarn run dev
```

The client is built on Networked Aframe and React, and uses Nextjs for simplified page routing and Server Side Rendering

Typescript and strict linting are enforced

TODO: Add all dependencies, explain each component and our decision to use, add links to tutorials

## Redux store management

We are putting Redux actions into redux folder.

There are following files.

actions.ts          : In this file, we are defining all actions which is using this app.
feathers.ts         : In this file, we defined the feathers app.
                      You don't need to change this file.
                      You can set the `featherStoreKey` from `/config/server.ts` for the storage key of the feathers.
persisted.store.ts  : In this file, we synchronize store varialble with local storage.
                      You don't need to change this file.
                      You can set `localStorageKey` from `/config/server.ts` for the redux store key.
reducers            : In this file, we are defining all reducers.
                      Once you add a new reducer, please add that under the line `auth: authReducer`.
                      If you don't add the reducer into this, you can't dispatch actions you added.
service.common.ts   : In this file, we are defining utility functions which are commonly used.
store.ts            : In this file, we defined Redux store.
auth/actions.ts     : In this file, we defined authentication actions.
auth/reducers.ts    : In this file, we defined AuthState and action process routines.
auth/services.ts    : In this file, we defined service function for authorization.
auth/selector.ts    : In this file, we defined state selector for AuthState.

### How to use Redux.

```
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { 
  loginUserByEmail,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'

...

interface Props {
  auth: any,
  loginUserByEmail: typeof loginUserByEmail;
};

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),   // fetch authState from store.
                                    // Note: `state` and `auth` is Immutable variable.
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByEmail: bindActionCreators(loginUserByEmail, dispatch)  // Mapping service to props
});

...

class Login extends React.Component<LoginProps> {
...
    handleEmailLogin = (e: any) => {
        // call service which is mapping with redux.
        this.props.loginUserByEmail({
            email: this.state.email,
            password: this.state.password
        });
  }
...
}

...

// we should connect Redux and Component like as following.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

```

### Tutorial for Redux store.

Let's explain step by step about the login process.
1. We should declare `LOGIN_USER_BY_EMAIL_SUCCESS` and `LOGIN_USER_BY_EMAIL_ERROR` actions.
    Add following lines in `/redux/actions.ts`.
    ```
    export const LOGIN_USER_BY_EMAIL_SUCCESS = 'LOGIN_USER_BY_EMAIL_SUCCESS';
    export const LOGIN_USER_BY_EMAIL_ERROR = 'LOGIN_USER_BY_EMAIL_ERROR';
    ```
2. We should define actions && reducers && services.
    - Create the `auth` folder in `/redux` folder.
    - Add the `actions.ts` file in `/redux/auth` folder.
    - Add the following codes in `actions.ts` file.
    ```
    import {
        LOGIN_USER_BY_GITHUB_ERROR,
        LOGIN_USER_BY_GITHUB_SUCCESS
    } from '../actions';

    export function loginUserByEmailSuccess(user: any): any {
        return {
            type: LOGIN_USER_BY_EMAIL_SUCCESS,
            user,
            message: ''
        }
    }

    export function loginUserByEmailError(err: string): any {
        return {
            type: LOGIN_USER_BY_EMAIL_ERROR,
            message: err
        }
    }
    ```
    - Add the `reducers.ts` file in `/redux/auth` folder.
    - Add the following codes in `reducers.ts` 
    ```
    import Immutable from 'immutable';
    import { 
        LOGIN_USER_BY_EMAIL_SUCCESS,
        LOGIN_USER_BY_EMAIL_ERROR
    } from "../actions";

    export const initialState: AuthState = {
        isLogined: false,
        user: undefined,
        error: '',

        isProcessing: false
    };

    // Note: In next.js, we should use Immutable variable for state type.
    const immutableState = Immutable.fromJS(initialState);

    const authReducer = (state = immutableState, action: any): any => {
        switch(action.type) {
            case LOGIN_USER_BY_EMAIL_SUCCESS:
                return state
                    .set('isLogined', true)
                    .set('user', (action as LoginResultAction).user);
            case LOGIN_USER_BY_EMAIL_ERROR:
                return state
                    .set('error', (action as LoginResultAction).message);
        }

        return state;
    }

    export default authReducer;
    ```
    - Add the `selector.ts` file in `/redux/auth` folder.
    ```
    import { createSelector } from 'reselect';

    // Note: 'auth' is the state key so you can change this whatever you want.
    const selectState = (state: any) => state.get('auth');
    export const selectAuthState = createSelector([selectState], (auth) => auth);

    ```
    - Add the `service.ts` file in `/redux/auth` folder.
    ```
    ...

    export function loginUserByEmail(form: any) {
        return (dispatch: Dispatch) => {
            dispatch(actionProcessing(true));

            client.authenticate({
                strategy: 'local',
                email: form.email,
                password: form.password
            })
            .then((res: any) => {
            const val = res as AuthUser;
            if (!val.user.isVerified) {
                client.logout();
                return dispatch(loginUserByEmailError('Unverified user'));
            }
            return dispatch(loginUserByEmailSuccess(val));
            })
            .catch(() => dispatch(loginUserByEmailError('Failed to login')))
            .finally( ()=> dispatch(actionProcessing(false)));
        };
    }
    ```

    - Add the following codes in `/redux/reducers.ts` file to combine reducers.
    ```
    import { combineReducers } from 'redux-immutable';
    import authReducer from './auth/reducers';

    export default combineReducers({
        auth: authReducer
    });
    ```

3. How to use the Redux store and services in Component.
   Please refer `How to use Redux` section.