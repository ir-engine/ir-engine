import config from '../../config';

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'entity',
  randomize: false,
  templates: [
    {
      id : "82639390-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      name : "crater",
      parent : null,
      index : null,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639391-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "E8D3129B-68BF-473F-92B9-6DAEC83514BB",
      name : "skybox",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 0,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639392-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "D8061EA5-F0C4-4452-ADFE-B179E2F20CB1",
      name : "directional light",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 1,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639393-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "633CD01A-BC2A-4584-99E2-2A3CFE2C8AD9",
      name : "spawn point",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 2,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639394-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "2D490729-384D-49AF-A755-9D6F70D56325",
      name : "floor plan",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 3,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639395-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "7B6895ED-83DA-4406-BBB8-EEB555BC6499",
      name : "ground plane",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 4,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    },
    {
      id : "82639396-24d5-11eb-b79e-9fcc0de52fce",
      entityId : "4696E8A5-6DDB-48DA-B67A-5104D3A3E442",
      name : "scene preview camera",
      parent : "2266BED7-6CC4-48A6-95DD-9BCD3CF9EAFC",
      index : 5,
      createdAt : "2020-11-12 10:54:59",
      updatedAt : "2020-11-12 10:54:59",
      collectionId : "825514a0-24d5-11eb-b79e-9fcc0de52fce",
      entityType : "default"
    }
  ]
};

export default seed;
