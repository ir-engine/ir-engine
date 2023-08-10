/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import {
  AvatarInterface,
  InstanceAttendanceInterface,
  LocationAdminInterface,
  LocationAuthorizedUserInterface,
  LocationBanInterface,
  LocationInterface,
  LocationSettingsInterface,
  LocationTypeInterface,
  UserApiKeyInterface,
  UserInterface
} from '@etherealengine/common/src/dbmodels/UserInterface'

import { Application } from '../../../declarations'
import { createInstanceAuthorizedUserModel } from '../../networking/instance/instance.model'

/**
 * This model contain users information
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const User = sequelizeClient.define<Model<UserInterface>>(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      inviteCode: {
        type: DataTypes.STRING,
        unique: true
      },
      did: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(User as any).associate = (models: any): void => {
    ;(User as any).hasMany(createInstanceAttendanceModel(app), { as: 'instanceAttendance' })
    ;(User as any).hasOne(models.user_settings)
    ;(User as any).belongsToMany(models.user, {
      as: 'relatedUser',
      through: models.user_relationship
    })
    ;(User as any).hasMany(models.user_relationship, { onDelete: 'cascade' })
    ;(User as any).hasMany(models.identity_provider, { onDelete: 'cascade' })
    ;(User as any).hasMany(models.channel)
    ;(User as any).belongsToMany(createLocationModel(app), { through: 'location-admin' })
    ;(User as any).hasMany(createLocationAdminModel(app), { unique: false })
    ;(User as any).hasMany(createLocationBanModel(app), { as: 'locationBans' })
    ;(User as any).hasMany(models.bot, { foreignKey: 'userId' })
    ;(User as any).hasMany(models.scope, { foreignKey: 'userId', onDelete: 'cascade' })
    ;(User as any).belongsToMany(models.instance, { through: 'instance-authorized-user' })
    ;(User as any).hasMany(createInstanceAuthorizedUserModel(app), { foreignKey: { allowNull: false } })
    ;(User as any).hasOne(createUserApiKeyModel(app))
    ;(User as any).belongsTo(createAvatarModel(app))
    ;(User as any).hasMany(models.user_kick, { onDelete: 'cascade' })
  }

  return User
}

export const createUserApiKeyModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const UserApiKey = sequelizeClient.define<Model<UserApiKeyInterface>>(
    'user-api-key',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(UserApiKey as any).associate = (models: any): void => {
    ;(UserApiKey as any).belongsTo(models.user, { foreignKey: { allowNull: false, onDelete: 'cascade', unique: true } })
  }

  return UserApiKey
}

export const createAvatarModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Avatar = sequelizeClient.define<Model<AvatarInterface>>(
    'avatar',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      identifierName: {
        type: DataTypes.STRING,
        unique: true
      },
      modelResourceId: {
        type: DataTypes.STRING
      },
      thumbnailResourceId: {
        type: DataTypes.STRING
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      userId: {
        type: DataTypes.UUID
      },
      project: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(Avatar as any).associate = (models: any): void => {
    ;(Avatar as any).hasMany(models.user)
  }

  return Avatar
}

export const createLocationModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const location = sequelizeClient.define<Model<LocationInterface>>(
    'location',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sceneId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slugifiedName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      isLobby: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      maxUsersPerInstance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(location as any).associate = (models: any): void => {
    ;(location as any).hasMany(models.instance)
    ;(location as any).hasMany(createLocationAdminModel(app))
    // (location as any).belongsTo(models.scene, { foreignKey: 'sceneId' }); // scene
    ;(location as any).belongsToMany(models.user, { through: 'location-admin' })
    ;(location as any).hasOne(createLocationSettingsModel(app), { onDelete: 'cascade' })
    ;(location as any).hasMany(createLocationBanModel(app), { as: 'locationBans' })
    ;(location as any).hasMany(models.bot, { foreignKey: 'locationId' })
    ;(location as any).hasMany(createLocationAuthorizedUserModel(app), { onDelete: 'cascade' })
  }

  return location
}

export const createLocationSettingsModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const LocationSettings = sequelizeClient.define<Model<LocationSettingsInterface>>(
    'location-setting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      videoEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      audioEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      screenSharingEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      faceStreamingEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  ;(LocationSettings as any).associate = function (models: any): void {
    ;(LocationSettings as any).belongsTo(createLocationModel(app), { required: true, allowNull: false })
    ;(LocationSettings as any).belongsTo(createLocationTypeModel(app), {
      foreignKey: 'locationType',
      defaultValue: 'private'
    })
  }

  return LocationSettings
}

export const createLocationTypeModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationType = sequelizeClient.define<Model<LocationTypeInterface>>(
    'location-type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(locationType as any).associate = (models: any): void => {
    ;(locationType as any).hasMany(createLocationSettingsModel(app), { foreignKey: 'locationType' })
  }

  return locationType
}

export const createLocationBanModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationBan = sequelizeClient.define<Model<LocationBanInterface>>(
    'location-ban',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(locationBan as any).associate = function (models: any): void {
    ;(locationBan as any).belongsTo(createLocationModel(app))
    ;(locationBan as any).belongsTo(models.user)
  }

  return locationBan
}

export const createLocationAuthorizedUserModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationAuthorizedUser = sequelizeClient.define<Model<LocationAuthorizedUserInterface>>(
    'location-authorized-user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(locationAuthorizedUser as any).associate = (models: any): void => {
    ;(locationAuthorizedUser as any).belongsTo(createLocationModel(app), {
      required: true,
      foreignKey: { allowNull: true },
      onDelete: 'cascade'
    })
    ;(locationAuthorizedUser as any).belongsTo(models.user, {
      required: true,
      foreignKey: { allowNull: true },
      onDelete: 'cascade'
    })
  }
  return locationAuthorizedUser
}

export const createLocationAdminModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationAdmin = sequelizeClient.define<Model<LocationAdminInterface>>(
    'location-admin',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(locationAdmin as any).associate = function (models: any): void {
    ;(locationAdmin as any).belongsTo(createLocationModel(app), { required: true, allowNull: false })
    ;(locationAdmin as any).belongsTo(models.user, { required: true, allowNull: false })
  }

  return locationAdmin
}

export const createInstanceAttendanceModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceAttendance = sequelizeClient.define<Model<InstanceAttendanceInterface>>(
    'instance-attendance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sceneId: {
        type: DataTypes.STRING
      },
      isChannel: {
        type: DataTypes.BOOLEAN
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )
  ;(instanceAttendance as any).associate = (models: any): void => {
    ;(instanceAttendance as any).belongsTo(models.instance)
    ;(instanceAttendance as any).belongsTo(models.user)
  }
  return instanceAttendance
}
