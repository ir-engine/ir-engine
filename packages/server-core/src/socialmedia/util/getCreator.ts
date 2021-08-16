/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { QueryTypes } from 'sequelize'

export const getCreatorByUserId = async (userId, app) => {
  if (userId) {
    const [creator] = await app.query(`SELECT id  FROM \`creator\` WHERE userId=:userId`, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { userId }
    })
    return creator?.id || null
  }
  return null
}
