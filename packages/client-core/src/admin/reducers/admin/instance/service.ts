import { Dispatch } from 'redux';
import {
  instancesRetrievedAction,
  instanceCreated,
  instanceRemoved,
  instancePatched
} from './actions';
import { client } from '../../../../feathers';
import { dispatchAlertError } from '../../../../common/reducers/alert/service';


export function fetchAdminInstances() {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      const user = getState().get('auth').get('user');
      try {
        if (user.userRole === 'admin') {
          const instances = await client.service('instance').find({
            query: {
              $sort: {
                createdAt: -1
              },
              $skip: getState().get('adminUser').get('users').get('skip'),
              $limit: getState().get('adminUser').get('users').get('limit'),
              action: 'admin'
            }
          });
          dispatch(instancesRetrievedAction(instances));
        }
      } catch (err) {
        console.error(err);
        dispatchAlertError(dispatch, err.message);
      }
    };
  }
export function createInstance(instance: any) {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('instance').create(instance);
        dispatch(instanceCreated(result));
      } catch (error) {
        console.error(error);
        dispatchAlertError(dispatch, error.message);
      }
    };
  }
export function patchInstance(id: string, instance) {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('instance').patch(id, instance);
        dispatch(instancePatched(result));
      } catch (error) {
        console.error(error);
      }
    };
  }
  
  export function removeInstance(id: string) {
    return async (dispatch: Dispatch): Promise<any> => {
      const result = await client.service('instance').remove(id);
      dispatch(instanceRemoved(result));
    };
  }