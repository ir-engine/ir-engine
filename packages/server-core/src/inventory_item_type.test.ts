import assert from 'assert'
import app from "../../server/src/app"

describe('Check Inventory Item Type', () => {

      // Check inventory-item-type
      it('should initialise inventory item type', async () => {
        const service = await app.service('inventory-item-type')
        assert.ok(service, 'Registered the service');
      })

      // Creating an item in inventory item type
       it('should create an inventory item type', async () => {
         const item = await app.service('inventory-item-type').create({
           "inventoryItemType": "skill inventory x9000"
         });
         assert.ok(item.inventoryItemTypeId, "Should return a unique Id");
       })

      // Must delete an existing inventory item type
       it('should delete an inventory item type', async () => {
         const item = await app.service('inventory-item-type').remove('0833e250-3b3b-11ec-b1f7-bd97dd4dc722');
         assert.ok(item, "Item is deleted");
       })

})