/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

/**
 * A class for Feed service
 */
export class Notifications extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params user id
   * @returns {@Array} of found users
   */

  async find(params: Params): Promise<any> {
    let action = params.action
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    if (action === 'getNotificationId') {
      const feedId = params.feedId
      const type = params.type

      const dataQuery = `SELECT id 
      FROM \`notifications\` 
      WHERE feedId=:feedId AND creatorAuthorId=:creatorId AND type=:type`

      const [notification] = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          feedId,
          creatorId,
          type
        }
      })
      return notification
    }

    action = params.query?.action
    if (action === 'byCurrentCreator') {
      const dataQuery = `SELECT notifications.*, sr.url as previewUrl, creator.username as creator_username,  sr2.url as avatar, comments.text as comment_text 
        FROM \`notifications\` as notifications
        LEFT JOIN \`feed\` as feed ON feed.id=notifications.feedId
        LEFT JOIN \`static_resource\` as sr ON sr.id=feed.previewId
        JOIN \`creator\` as creator ON creator.id=notifications.creatorAuthorId
        LEFT JOIN \`static_resource\` as sr2 ON sr2.id=creator.avatarId
        LEFT JOIN \`comments\` as comments ON comments.id=notifications.commentId
        WHERE notifications.creatorViewerId=:creatorId 
        ORDER BY notifications.createdAt DESC`

      const notificationList = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          creatorId
        }
      })
      return notificationList
    }
    return 1
  }
}
