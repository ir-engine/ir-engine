import ArMedia from './ar-media/ar-media.service'
import CommentsFires from './comments-fires/comments-fires.service'
import Comments from './comments/comments.service'
import Creator from './creator/creator.service'
import FeedBookmark from './feed-bookmark/feed-bookmark.service'
import FeedFires from './feed-fires/feed-fires.service'
import Feed from './feed/feed.service'
import TheFeedsFires from './feeds-fires/feeds-fires.service'
import TheFeeds from './feeds/feeds.service'
import FollowCreator from './follow-creator/follow-creator.service'
// import TheFeedsBookmark from './feeds-bookmark/feeds-bookmark.service';

export default [
  Creator,
  Feed,
  FeedFires,
  FeedBookmark,
  Comments,
  CommentsFires,
  FollowCreator,
  ArMedia,
  TheFeeds,
  TheFeedsFires
  //   TheFeedsBookmark
]
