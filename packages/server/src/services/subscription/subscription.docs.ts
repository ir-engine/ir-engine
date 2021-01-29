export default {
    definitions: {
      subscription_list: {
        type: 'object',
        required: ['amount', 'currency', 'quantity', 'status'],
        properties: {
          plan: {
            type: 'string'
          },
          amaunt: {
            type: 'string'
          },
          currency: {
            type: 'string'
          },
          quantity: {
            type: 'string'
          },
          status: {
            type: 'boolean'
          },
          unusedSeats: {
            type: 'integer'
          },
          pendingSeats: {
            type: 'integer'
          },
          filledSeats: {
            type: 'integer'
          }
        }
      },
      subscription: {
        type: 'object',
        properties: {
          plan: {
            type: 'string'
          },
          amaunt: {
           type: 'string'
         },
         currency: {
           type: 'string'
         },
         quantity: {
           type: 'string'
         },
         status: {
           type: 'boolean'
         },
         unusedSeats: {
           type: 'integer'
         },
         pendingSeats: {
           type: 'integer'
         },
         filledSeats: {
           type: 'integer'
         }
        }
        
      }
    }
 }