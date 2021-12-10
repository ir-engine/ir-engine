/**
 * An object for inv documentation configiration
 *
 * @author DRC
 */
export default {
  definitions: {
    'user-trade': {
      type: 'object',
      properties: {
        tradeId: {
          type: 'string'
        },
        fromUser: {
          type: 'string'
        },
        toUser: {
          type: 'string'
        },
        fromUserInventoryId1: {
          type: 'string'
        },
        fromUserInventoryId2: {
          type: 'string'
        },
        fromUserInventoryId3: {
          type: 'string'
        },
        fromUserInventoryId4: {
          type: 'string'
        },
        fromUserInventoryId5: {
          type: 'string'
        },
        fromUserInventoryId6: {
          type: 'string'
        },
        fromUserInventoryId7: {
          type: 'string'
        },
        fromUserInventoryId8: {
          type: 'string'
        },
        fromUserInventoryId9: {
          type: 'string'
        },
        fromUserInventoryId10: {
          type: 'string'
        },

        toUserInventoryId1: {
          type: 'string'
        },
        toUserInventoryId2: {
          type: 'string'
        },
        toUserInventoryId3: {
          type: 'string'
        },
        toUserInventoryId4: {
          type: 'string'
        },
        toUserInventoryId5: {
          type: 'string'
        },
        toUserInventoryId6: {
          type: 'string'
        },
        toUserInventoryId7: {
          type: 'string'
        },
        toUserInventoryId8: {
          type: 'string'
        },
        toUserInventoryId9: {
          type: 'string'
        },
        toUserInventoryId10: {
          type: 'string'
        },

        fromUserStatus: {
          type: 'string'
        },

        toUserStatus: {
          type: 'string'
        },
        addedOn: {
          type: 'date'
        }
      }
    },
    'user-trade_list': {
      type: 'array',
      items: { $ref: '#/definitions/user-trade' }
    }
  }
}
