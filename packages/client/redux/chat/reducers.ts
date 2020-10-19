import Immutable from 'immutable';
import {
  LoadedMessagesAction,
  LoadedChannelAction,
  CreatedMessageAction,
  LoadedChannelsAction,
  RemovedMessageAction,
  ChatAction,
  ChatTargetSetAction,
  SetMessageScrollInitAction,
  CreatedChannelAction,
  PatchedChannelAction,
  RemovedChannelAction
} from './actions';

import {
  CREATED_MESSAGE,
  FETCHING_PARTY_CHANNEL,
  LOADED_CHANNEL,
  LOADED_CHANNELS,
  LOADED_MESSAGES,
  PATCHED_MESSAGE,
  REMOVED_MESSAGE,
  CHAT_TARGET_SET,
  SET_MESSAGE_SCROLL_INIT,
  CREATED_CHANNEL,
  PATCHED_CHANNEL,
  REMOVED_CHANNEL
} from '../actions';

import { Message } from '@xr3ngine/common/interfaces/Message';
import { Channel } from '@xr3ngine/common/interfaces/Channel';

import _ from 'lodash';
import moment from 'moment';

export const initialState = {
  channels: {
    channels: {},
    limit: 5,
    skip: 0,
    total: 0,
    updateNeeded: true,
  },
  targetObjectType: '',
  targetObject: {},
  targetChannelId: '',
  updateMessageScroll: false,
  messageScrollInit: false,
  partyChannelFetching: false,
  partyChannelFetched: false
};

const immutableState = Immutable.fromJS(initialState);

const chatReducer = (state = immutableState, action: ChatAction): any => {
  let updateMap, localAction, updateMapChannels, updateMapChannelsChild, returned;
  switch (action.type) {
    case LOADED_CHANNELS:
      localAction = (action as LoadedChannelsAction);
      updateMap = new Map(state.get('channels'));
      updateMap.set('limit', localAction.limit);
      updateMap.set('skip', localAction.skip);
      updateMap.set('total', localAction.total);
      updateMapChannels = new Map((updateMap as any).get('channels'));
      updateMap.set('updateNeeded', false);
      localAction.channels.forEach((channel) => {
        if (updateMapChannels[channel.id] == null) {
          channel.updateNeeded = true;
          channel.limit = 8;
          channel.skip = 0;
          channel.total = 0;
          updateMapChannels.set(channel.id, channel);
        }
      });
      updateMap.set('channels', updateMapChannels);
      return state
          .set('channels', updateMap);
    case LOADED_CHANNEL:
      localAction = (action as LoadedChannelsAction);
      const newChannel = localAction.channel;
      const channelType = localAction.channelType;
      updateMap = new Map(state.get('channels'));
      updateMapChannels = new Map((updateMap as any).get('channels'));
      if (newChannel?.id != null && updateMapChannels[newChannel.id] == null) {
        newChannel.updateNeeded = true;
        newChannel.limit = 10;
        newChannel.skip = 0;
        newChannel.total = 0;
        updateMapChannels.set(newChannel.id, newChannel);
      }
      updateMap.set('channels', updateMapChannels);
      returned = state
          .set('channels', updateMap);
      if (channelType === 'party') returned = returned.set('fetchingPartyChannel', false).set('partyChannelFetched', true);
      return returned;
    case CREATED_MESSAGE:
      localAction = (action as CreatedMessageAction);
        const channelId = localAction.message.channelId;
        const selfUser = localAction.selfUser;
      updateMap = new Map(state.get('channels'));
      updateMapChannels = new Map((updateMap as any).get('channels'));
      updateMapChannelsChild = (updateMapChannels as any).get(channelId);
      if (updateMapChannelsChild == null) {
        updateMap.set('updateNeeded', true);
      }
      else {
        updateMapChannelsChild.messages = (updateMapChannelsChild.messages == null || updateMapChannelsChild.messages.size != null || updateMapChannels.get('updateNeeded') === true) ? [localAction.message] : _.unionBy(updateMapChannelsChild.messages, [localAction.message], 'id');
        updateMapChannelsChild.skip = updateMapChannelsChild.skip + 1;
        updateMapChannelsChild.updatedAt = moment().utc().toJSON();
        updateMapChannels.set(channelId, updateMapChannelsChild);
        updateMap.set('channels', updateMapChannels);
      }
      returned = state
        .set('channels', updateMap)
        .set('updateMessageScroll', true);

      if (state.get('targetChannelId').length === 0 && updateMapChannelsChild != null) {
        const channelType = updateMapChannelsChild.channelType;
        const targetObject = channelType === 'user' ? (updateMapChannelsChild.userId1 === selfUser.id ? updateMapChannelsChild.user2 : updateMapChannelsChild.user1) : channelType === 'group' ? updateMapChannelsChild.group : updateMapChannelsChild.party;
        returned = returned
          .set('targetChannelId', channelId)
          .set('targetObjectType', channelType)
          .set('targetObject', targetObject);
      }
      return returned;
    case LOADED_MESSAGES:
      localAction = (action as LoadedMessagesAction);
      updateMap = new Map(state.get('channels'));
        updateMapChannels = updateMap.get('channels');
        updateMapChannelsChild = (updateMapChannels.get(localAction.channelId));
        updateMapChannelsChild.messages = (updateMapChannelsChild == null || updateMapChannelsChild.messages == null || updateMapChannelsChild.messages.size != null || updateMapChannels.get('updateNeeded') === true) ? localAction.messages : _.unionBy(updateMapChannelsChild.messages, localAction.messages, 'id');
        updateMapChannelsChild.limit = localAction.limit;
        updateMapChannelsChild.skip = localAction.skip;
        updateMapChannelsChild.total = localAction.total;
        updateMapChannelsChild.updateNeeded = false;
        updateMapChannels.set(localAction.channelId, updateMapChannelsChild);
        updateMap.set('channels', updateMapChannels);
      return state
          .set('channels', updateMap);
    case REMOVED_MESSAGE:
      localAction = (action as RemovedMessageAction);
      updateMap = new Map(state.get('channels'));

        updateMapChannels = new Map(updateMap.get('channels'));
        updateMapChannelsChild = (updateMapChannels as any).get(localAction.message.channelId);
        if (updateMapChannelsChild != null) {
            _.remove(updateMapChannelsChild.messages, (message: Message) => message.id === localAction.message.id);
            updateMapChannelsChild.skip = updateMapChannelsChild.skip - 1;
            updateMapChannels.set(localAction.message.channelId, updateMapChannelsChild);
            updateMap.set('channels', updateMapChannels);
        }
      return state
          .set('channels', updateMap);
    case PATCHED_MESSAGE:
      localAction = (action as LoadedMessagesAction);
      updateMap = new Map(state.get('channels'));

      updateMapChannels = new Map(updateMap.get('channels'));
      updateMapChannelsChild = (updateMapChannels as any).get(localAction.message.channelId);
      if (updateMapChannelsChild != null) {
        updateMapChannelsChild.messages = updateMapChannelsChild.messages.map((message: Message) => message.id === localAction.message.id ? localAction.message : message);
        updateMapChannels.set(localAction.message.channelId, updateMapChannelsChild);
        updateMap.set('channels', updateMapChannels);
      }
      return state
          .set('channels', updateMap);
    case CREATED_CHANNEL:
      localAction = (action as CreatedChannelAction);
      const createdChannel = localAction.channel;
      updateMap = new Map(state.get('channels'));

      updateMapChannels = new Map(updateMap.get('channels'));
        updateMapChannels.set(createdChannel.id, createdChannel);
        updateMap.set('channels', updateMapChannels);

      return state
          .set('channels', updateMap);
    case PATCHED_CHANNEL:
      localAction = (action as PatchedChannelAction);
        const updateChannel = localAction.channel;
      updateMap = new Map(state.get('channels'));

      updateMapChannels = new Map(updateMap.get('channels'));
      updateMapChannelsChild = (updateMapChannels as any).get(localAction.channel.id);
      if (updateMapChannelsChild != null) {
        updateMapChannelsChild.updatedAt = updateChannel.updatedAt;
        updateMapChannelsChild.group = updateChannel.group;
        updateMapChannelsChild.party = updateChannel.party;
        updateMapChannelsChild.user1 = updateChannel.user1;
        updateMapChannelsChild.user2 = updateChannel.user2;
        updateMapChannels.set(localAction.channel.id, updateMapChannelsChild);
        updateMap.set('channels', updateMapChannels);
      }
      return state
          .set('channels', updateMap);
    case REMOVED_CHANNEL:
      localAction = (action as RemovedChannelAction);
      updateMap = new Map(state.get('channels'));
      updateMapChannels = new Map(updateMap.get('channels'));
      updateMapChannels.delete(localAction.channel.id);
      updateMap.set('channels', updateMapChannels);
      return state
          .set('channels', updateMap);

    case CHAT_TARGET_SET:
      const { targetObjectType, targetObject, targetChannelId } = (action as ChatTargetSetAction);
      return state
          .set('targetObjectType', targetObjectType)
          .set('targetObject', targetObject)
          .set('targetChannelId', targetChannelId)
          .set('updateMessageScroll', true)
          .set('messageScrollInit', true);

    case SET_MESSAGE_SCROLL_INIT:
      const { value } = (action as SetMessageScrollInitAction);
      return state.set('messageScrollInit', value);

    case FETCHING_PARTY_CHANNEL:
      return state.set('fetchingPartyChannel', true);
  }

  return state;
};

export default chatReducer;
