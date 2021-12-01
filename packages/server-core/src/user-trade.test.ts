import assert from 'assert'
import app from "../../server/src/app"
import  data  from "./inventory_item.test"

var tradedata = data.trading_data
var inventoryItemTypeId = null
var tobeTrade = null
var tobeRemoved = null
var datax = null


describe('Check User Trade', () => {

    // Check User Inventory Service
    it('should initialise user trade', async () => {
      const service = await app.service('user-trade')
      assert.ok(service, 'Registered the service');
    })
    //  Creating a trade object
     it('should create a user trade id', async () => {
      const item = await app.service('user-trade').create({
        "fromUserId" : "ac2ce810-3f15-11ec-929f-05fac043d297",
        "toUserId" : "ac2ce811-3f15-11ec-929f-05fac043d297",
        "fromUserInventoryIds": [
                    tradedata
                ],
        "fromUserStatus": "REQUEST"
    });
    tobeRemoved = item.userTradeId
      assert.ok(item.userTradeId, "Should return a unique Id");
  })

  it('should patch a user trade item : Receiver Accepts', async () => {
    const item = await app.service('user-trade').patch(tobeRemoved,{
      "toUserStatus": "ACCEPT"
    });
    assert.ok(item, "Receiver accepted offer.");
  })

  it('should patch a user trade item : Sender Approves', async () => {
    const item = await app.service('user-trade').patch(tobeRemoved,{
      "fromUserStatus": "ACCEPT"
    });
    assert.ok(item, "Sender initiates transfer");
  })
  
   // Must delete user trade
   it('should delete a user trade item', async () => {
    const item = await app.service('user-trade').remove(tobeRemoved);
    assert.ok(item, "Item is deleted");
  })

  // Removed  an existing and valid inventory item.
  it('should delete an inventory item', async () => {
    const item = await app.service('inventory-item').remove(tradedata.inventoryItemId);
    assert.ok(item, "Inventory Item is deleted");
  })
})