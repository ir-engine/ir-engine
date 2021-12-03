import assert from 'assert'
import app from "../../server/src/app"
import  dataToBeSent from "./inventory-item-type.test"
let dataToBeSent2 = {
  "inventoryItemId" : null
}
let tobeRemoved = null
let trading_data = {
  "inventoryItemId" : null
}

describe('Check Inventory Item', () => {

  // Check inventory-item
  it('should initialise inventory item', async () => {
    const service = await app.service('inventory-item')
    assert.ok(service, 'Registered the service');
  })

  // Creating an item in inventory item
   it('should create an inventory item', async () => {
     const item = await app.service('inventory-item').create(
       {
         "inventoryItemTypeId": dataToBeSent.inventoryItemTypeId,
         "name": "Angry",
         "metadata": {"eyes":"joy","mouth":"surprised","level":2,"stamina":9.3},
         "description": "angry",
         "url": "https://arkh-frontend.s3.us-west-1.amazonaws.com/spacejet/new1.png"
     }
     );
     tobeRemoved = item.inventoryItemId
     assert.ok(item.inventoryItemId, "Should return a unique Id");
   })

   // Creating an item in inventory item
   it('should create an inventory item', async () => {
    const item = await app.service('inventory-item').create(
      {
        "inventoryItemTypeId": dataToBeSent.inventoryItemTypeId,
        "name": "Happy",
        "metadata": {"eyes":"joy","mouth":"surprised","level":2,"stamina":5.3},
        "description": "happy",
        "url": "https://arkh-frontend.s3.us-west-1.amazonaws.com/spacejet/new2.png"
    }
    );
    dataToBeSent2.inventoryItemId = item.inventoryItemId
    assert.ok(item.inventoryItemId, "Should return a unique Id");
  })

  it('should create an inventory item', async () => {
    const item = await app.service('inventory-item').create(
      {
        "inventoryItemTypeId": dataToBeSent.inventoryItemTypeId,
        "name": "Angry",
        "metadata": {"eyes":"joy","mouth":"surprised","level":2,"stamina":9.3},
        "description": "angry",
        "url": "https://arkh-frontend.s3.us-west-1.amazonaws.com/spacejet/new1.png"
    }
    );
    trading_data.inventoryItemId = item.inventoryItemId
    assert.ok(item.inventoryItemId, "Should return a unique Id");
  })

  // Removed  an existing and valid inventory item.
   it('should delete an inventory item', async () => {
     const item = await app.service('inventory-item').remove(tobeRemoved);
     assert.ok(item, "Inventory Item is deleted");
   })
})

export default {dataToBeSent2,trading_data}