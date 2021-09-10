import Creator from './creator/creator.service'
import Feed from './feed/feed.service'
import FeedFires from './feed-fires/feed-fires.service'
import FeedReport from './feed-report/feed-report.service'
import FeedBookmark from './feed-bookmark/feed-bookmark.service'
import Comments from './comments/comments.service'
import CommentsFires from './comments-fires/comments-fires.service'
import FollowCreator from './follow-creator/follow-creator.service'
import ArMedia from './ar-media/ar-media.service'
import TheFeeds from './feeds/feeds.service'
import TheFeedsFires from './feeds-fires/feeds-fires.service'
import BlockCreator from './block-creator/block-creator.service'
// import TheFeedsBookmark from './feeds-bookmark/feeds-bookmark.service';

export default [
  Creator,
  Feed,
  FeedFires,
  FeedBookmark,
  FeedReport,
  Comments,
  CommentsFires,
  FollowCreator,
  ArMedia,
  TheFeeds,
  TheFeedsFires,
  BlockCreator
  //   TheFeedsBookmark
]
