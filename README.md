[![Build Status](https://travis-ci.org/xrchat/xrchat-client.svg?branch=master)](https://travis-ci.org/xrchat/xrchat-client)
# XRChat Client
## About

XRChat is an end-to-end solution for hosting humans and non-humans in a virtual space. This project would literally not be possible without the community contributions of Mozilla Hubs, Janus VR, Avaer + Exokit, Mr Doob, Hayden James Lee and many others.

Our goal is an easy-to-use, well documented, end-to-end Javascript (or Typescript) exprience that anyone with a little bit of Javascript and HTML knowledge can dig into, deploy and make meaningful modifications and contributions to. If you fit this category and you are struggling with any aspect of getting started, we want to hear fromm you so that this can be a better exprience.

XRChat is a free, open source, MIT-licensed project. You are welcome to do anything you want with it. We hope that you use it to make something beautiful.

This is the client portion of XRChat. To deploy everything at once with Kubernetes or Docker Compose, check out the branches in xrchat-ops. Or you can start the server with NPM (check out scripts/start-db.sh to get the database runnning), run the xrchat-client client and everything should connect out of the box.

## Getting Started

To run

```
npm install
npm run build
npm run dev
```

The client is built on Networked Aframe and React, and uses Nextjs for simplified page routing and Server Side Rendering

Typescript and strict linting are enforced

TODO: Add all dependencies, explain each component and our decision to use, add links to tutorials

## config file

### xr

#### networked-scene

properties for the [NAF](https://github.com/networked-aframe/networked-aframe) networked-scene component

- **app** unique app name (no spaces)
- **room** name of initial room
- **audio** set true to enable audio streaming (if using an adapter that supports it)
- **adapter** which network service to use
- **serverURL** where the WebSocket / signalling server is located

#### avatar

- **defaultAvatarModelSrc** gltf for the default avatar
- **defaultAvatarModelScale** scale for the default avatar

#### environment

##### floor

- **src** source for the floor texture
- **height** height(length) of the floor
- **width** width of the floor

##### skybox

- **src** source for the skybox texture
- **height** height(length) of the skybox texture
- **width** width of the skybox texture
- **radius** radius of the skybox
- **rotation** x,y,z rotation of the skybox
- **thetaLength** [skybox's](https://aframe.io/docs/master/primitives/a-sky.html) [vertical sweep angle size](https://threejs.org/docs/index.html#api/en/geometries/SphereBufferGeometry) in degrees

## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xrchat-client .

# Run the image (deletes itself when you close it)
docker run -d --rm --name client -e "API_SERVER_URL=http://localhost:3030" -p "3000:3000"  xrchat-client

# Stop the server
docker stop client
```

### Docker image configurations

This image uses build-time arguments, they are not used during runtime yet

- `NODE_ENV` controls the config/*.js file to load and build against [default: production]
- `API_SERVER_URL` points to an instance of the xrchat-server [default: http://localhost:3030]


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
  loginUserByPassword,
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'

...

interface Props {
  auth: any,
  loginUserByPassword: typeof loginUserByPassword
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),   // fetch authState from store.
                                    // Note: `state` and `auth` is Immutable variable.
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch)  // Mapping service to props
})

...

class Login extends React.Component<LoginProps> {
...
    handleEmailLogin = (e: any) => {
        // call service which is mapping with redux.
        this.props.loginUserByPassword({
            email: this.state.email,
            password: this.state.password
        })
  }
...
}

...

// we should connect Redux and Component like as following.
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)

```

### Tutorial for Redux store.

Let's explain step by step about the login process.
1. We should declare `LOGIN_USER_SUCCESS` and `LOGIN_USER_ERROR` actions.
    Add following lines in `/redux/actions.ts`.
    ```
    export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS'
    export const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR'
    ```
2. We should define actions && reducers && services.
    - Create the `auth` folder in `/redux` folder.
    - Add the `actions.ts` file in `/redux/auth` folder.
    - Add the following codes in `actions.ts` file.
    ```
    import {
        LOGIN_USER_BY_GITHUB_ERROR,
        LOGIN_USER_BY_GITHUB_SUCCESS
    } from '../actions'

    export function loginUserSuccess(user: any): any {
        return {
            type: LOGIN_USER_SUCCESS,
            user,
            message: ''
        }
    }

    export function loginUserError(err: string): any {
        return {
            type: LOGIN_USER_ERROR,
            message: err
        }
    }
    ```
    - Add the `reducers.ts` file in `/redux/auth` folder.
    - Add the following codes in `reducers.ts` 
    ```
    import Immutable from 'immutable'
    import { 
        LOGIN_USER_SUCCESS,
        LOGIN_USER_ERROR
    } from "../actions"

    export const initialState: AuthState = {
        isLoggedIn: false,
        user: undefined,
        error: '',

        isProcessing: false
    }

    // Note: In next.js, we should use Immutable variable for state type.
    const immutableState = Immutable.fromJS(initialState)

    const authReducer = (state = immutableState, action: any): any => {
        switch(action.type) {
            case LOGIN_USER_SUCCESS:
                return state
                    .set('isLoggedIn', true)
                    .set('user', (action as LoginResultAction).user)
            case LOGIN_USER_ERROR:
                return state
                    .set('error', (action as LoginResultAction).message)
        }

        return state
    }

    export default authReducer
    ```
    - Add the `selector.ts` file in `/redux/auth` folder.
    ```
    import { createSelector } from 'reselect'

    // Note: 'auth' is the state key so you can change this whatever you want.
    const selectState = (state: any) => state.get('auth')
    export const selectAuthState = createSelector([selectState], (auth) => auth)

    ```
    - Add the `service.ts` file in `/redux/auth` folder.
    ```
    ...

    export function loginUserByPassword(form: any) {
        return (dispatch: Dispatch) => {
            dispatch(actionProcessing(true))

            client.authenticate({
                strategy: 'local',
                email: form.email,
                password: form.password
            })
            .then((res: any) => {
            const val = res as AuthUser
            if (!val.user.isVerified) {
                client.logout()
                return dispatch(loginUserError('Unverified user'))
            }
            return dispatch(loginUserSuccess(val))
            })
            .catch(() => dispatch(loginUserError('Failed to login')))
            .finally( ()=> dispatch(actionProcessing(false)))
        }
    }
    ```

    - Add the following codes in `/redux/reducers.ts` file to combine reducers.
    ```
    import { combineReducers } from 'redux-immutable'
    import authReducer from './auth/reducers'

    export default combineReducers({
        auth: authReducer
    })
    ```

3. How to use the Redux store and services in Component.
   Please refer `How to use Redux` section.
