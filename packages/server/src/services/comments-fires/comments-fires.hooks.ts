import { addFeedCommentFire, removeFeedCommentFire } from "../../hooks/notifications";

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [addFeedCommentFire],
    update: [],
    patch: [],
    remove: [removeFeedCommentFire]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
