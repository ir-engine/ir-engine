import assert from 'assert'
import app from "../../server/src/app"
import data from "./inventory-item.test"


let dataToBeSent2 = data.dataToBeSent2
let tobeRemoved = null
let senderID: 'ac2ce810-3f15-11ec-929f-05fac043d297'
let receiverID: 'ac2ce811-3f15-11ec-929f-05fac043d297'
let extraID: 'c2ce812-3f15-11ec-929f-05fac043d297'

describe('Check User Inventory', () => {

  // Check User Inventory Service
  it('should initialise user inventory', async () => {
    const service = await app.service('user-inventory')
    assert.ok(service, 'Registered the service');
  })

  // Creating a User Inventory entry
  it('should create a user inventory id', async () => {
    const item = await app.service('user-inventory').create({
      "userId": senderID,
      "inventoryItemId": dataToBeSent2.inventoryItemId,
      "quantity": 1
    });
    tobeRemoved = item.userInventoryId
    assert.ok(item.userInventoryId, "Should return a unique Id");
  })

  // Changing owner of ID
  it('should change owner in user inventory', async () => {
    const item = await app.service('user-inventory').patch(tobeRemoved, {
      "userId": receiverID,
    }, null!);
    assert.ok(item.userInventoryId, "Should return a unique Id");
  })

  // Must delete user inventory
  it('should delete a user inventory item', async () => {
    const item = await app.service('user-inventory').remove(tobeRemoved);
    assert.ok(item, "Item is deleted");
  })
})