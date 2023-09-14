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

// TODO: Remove this file after feathers 5 migration

import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import {
  AvatarInterface,
  BotCommandInterface,
  ChannelUserInterface,
  IdentityProviderInterface,
  InstanceAttendanceInterface,
  InstanceAuthorizedUserInterface,
  InstanceInterface,
  LocationAdminInterface,
  LocationAuthorizedUserInterface,
  LocationBanInterface,
  LocationInterface,
  LocationSettingsInterface,
  LocationTypeInterface,
  MessageInterface,
  ProjectPermissionInterface,
  UserApiKeyInterface,
  UserInterface,
  UserKick,
  UserRelationshipInterface,
  UserRelationshipTypeInterface,
  UserSetting
} from '@etherealengine/common/src/dbmodels/UserInterface'

import { ProjectPermissionTypeData } from '@etherealengine/engine/src/schemas/projects/project-permission-type.schema'
import { Application } from '../declarations'

/**
 * This model contain users information
 */
export const createUserModel = (app: Application) => {
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
    ;(User as any).hasOne(createUserSettingModel(app))
    ;(User as any).belongsToMany(createUserModel(app), {
      as: 'relatedUser',
      through: createUserRelationshipModel(app)
    })
    ;(User as any).hasMany(createUserRelationshipModel(app), { onDelete: 'cascade' })
    ;(User as any).hasMany(createIdentityProviderModel(app), { onDelete: 'cascade' })
    ;(User as any).hasMany(models.channel)
    ;(User as any).belongsToMany(createLocationModel(app), { through: 'location-admin' })
    ;(User as any).hasMany(createLocationAdminModel(app), { unique: false })
    ;(User as any).hasMany(createLocationBanModel(app), { as: 'locationBans' })
    ;(User as any).hasMany(createBotModel(app), { foreignKey: 'userId' })
    ;(User as any).hasMany(models.scope, { foreignKey: 'userId', onDelete: 'cascade' })
    ;(User as any).belongsToMany(createInstanceModel(app), { through: 'instance-authorized-user' })
    ;(User as any).hasMany(createInstanceAuthorizedUserModel(app), { foreignKey: { allowNull: false } })
    ;(User as any).hasOne(createUserApiKeyModel(app))
    ;(User as any).belongsTo(createAvatarModel(app))
    ;(User as any).hasMany(createUserKickModel(app), { onDelete: 'cascade' })
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
    ;(UserApiKey as any).belongsTo(createUserModel(app), {
      foreignKey: { allowNull: false, onDelete: 'cascade', unique: true }
    })
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
    ;(Avatar as any).hasMany(createUserModel(app))
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
    ;(location as any).hasMany(createInstanceModel(app))
    ;(location as any).hasMany(createLocationAdminModel(app))
    // (location as any).belongsTo(models.scene, { foreignKey: 'sceneId' }); // scene
    ;(location as any).belongsToMany(createUserModel(app), { through: 'location-admin' })
    ;(location as any).hasOne(createLocationSettingsModel(app), { onDelete: 'cascade' })
    ;(location as any).hasMany(createLocationBanModel(app), { as: 'locationBans' })
    ;(location as any).hasMany(createBotModel(app), { foreignKey: 'locationId' })
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
    ;(locationBan as any).belongsTo(createUserModel(app))
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
    ;(locationAuthorizedUser as any).belongsTo(createUserModel(app), {
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
    ;(locationAdmin as any).belongsTo(createUserModel(app), { required: true, allowNull: false })
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
    ;(instanceAttendance as any).belongsTo(createInstanceModel(app))
    ;(instanceAttendance as any).belongsTo(createUserModel(app))
  }
  return instanceAttendance
}
export const createUserKickModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userKick = sequelizeClient.define<Model<UserKick>>(
    'user-kick',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      duration: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): any {
          options.raw = true
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['id']
        }
      ]
    }
  )

  ;(userKick as any).associate = (models: any): void => {
    ;(userKick as any).belongsTo(createUserModel(app), { as: 'user' })
    ;(userKick as any).belongsTo(createInstanceModel(app), { as: 'instance' })
  }

  return userKick
}

export const createUserSettingModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const UserSettings = sequelizeClient.define<Model<UserSetting>>(
    'user-setting',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      themeModes: {
        type: DataTypes.JSON,
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

  ;(UserSettings as any).associate = (models: any): void => {
    ;(UserSettings as any).belongsTo(createUserModel(app), { primaryKey: true, required: true, allowNull: false })
  }

  return UserSettings
}

export const createIdentityProviderModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const identityProvider = sequelizeClient.define<Model<IdentityProviderInterface>>(
    'identity-provider',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      token: { type: DataTypes.STRING, unique: true },
      accountIdentifier: { type: DataTypes.STRING },
      // password: { type: DataTypes.STRING },
      // isVerified: { type: DataTypes.BOOLEAN },
      // verifyToken: { type: DataTypes.STRING },
      // verifyShortToken: { type: DataTypes.STRING },
      // verifyExpires: { type: DataTypes.DATE },
      // verifyChanges: { type: DataTypes.JSON },
      // resetToken: { type: DataTypes.STRING },
      // resetExpires: { type: DataTypes.DATE },
      oauthToken: { type: DataTypes.STRING },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['email', 'sms', 'password', 'discord', 'github', 'google', 'facebook', 'twitter', 'linkedin', 'auth0']
      }
    } as any as IdentityProviderInterface,
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      indexes: [
        {
          fields: ['id']
        },
        {
          unique: true,
          fields: ['userId', 'token']
        },
        {
          unique: true,
          fields: ['userId', 'type']
        }
      ]
    }
  )
  ;(identityProvider as any).associate = (models: any): void => {
    ;(identityProvider as any).belongsTo(models.user, { required: true, onDelete: 'cascade' })
    ;(identityProvider as any).hasMany(models.login_token)
  }

  return identityProvider
}

const createUserRelationshipTypeModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationshipType = sequelizeClient.define<Model<UserRelationshipTypeInterface>>(
    'user-relationship-type',
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
        beforeCount(options: any): void {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  ;(userRelationshipType as any).associate = (models: any): void => {
    ;(userRelationshipType as any).hasMany(createUserRelationshipModel(app), { foreignKey: 'userRelationshipType' })
  }

  return userRelationshipType
}

export const createUserRelationshipModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationship = sequelizeClient.define<Model<UserRelationshipInterface>>(
    'user-relationship',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    } as any,
    {
      hooks: {
        beforeCount(options: any): any {
          options.raw = true
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['id']
        }
      ]
    }
  )

  ;(userRelationship as any).associate = (models: any): void => {
    ;(userRelationship as any).belongsTo(createUserModel(app), { as: 'user', constraints: false })
    ;(userRelationship as any).belongsTo(createUserModel(app), { as: 'relatedUser', constraints: false })
    ;(userRelationship as any).belongsTo(createUserRelationshipTypeModel(app), { foreignKey: 'userRelationshipType' })
  }

  return userRelationship
}

export const createProjectPermissionModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ProjectPermission = sequelizeClient.define<Model<ProjectPermissionInterface>>(
    'project-permission',
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

  ;(ProjectPermission as any).associate = (models: any): void => {
    ;(ProjectPermission as any).belongsTo(createUserModel(app), {
      foreignKey: 'userId',
      allowNull: false,
      onDelete: 'cascade'
    })
    ;(ProjectPermission as any).belongsTo(models.project, {
      foreignKey: 'projectId',
      allowNull: false,
      onDelete: 'cascade'
    })
    ;(ProjectPermission as any).belongsTo(createProjectPermissionTypeModel(app), { foreignKey: 'type' })
  }

  return ProjectPermission
}

export const createProjectPermissionTypeModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ProjectPermissionType = sequelizeClient.define<Model<ProjectPermissionTypeData>>(
    'project-permission-type',
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
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )
  ;(ProjectPermissionType as any).associate = (models: any): void => {
    ;(ProjectPermissionType as any).hasMany(createProjectPermissionModel(app), { foreignKey: 'type' })
  }

  return ProjectPermissionType
}

export const createBotModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Bot = sequelizeClient.define(
    'bot',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'etherealengine bot' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      description: {
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

  ;(Bot as any).associate = (models: any): void => {
    ;(Bot as any).belongsTo(createLocationModel(app), { foreignKey: 'locationId' })
    ;(Bot as any).belongsTo(createInstanceModel(app), { foreignKey: { allowNull: true } })
    ;(Bot as any).belongsTo(createUserModel(app), { foreignKey: 'userId' })
    ;(Bot as any).hasMany(createBotCommandModel(app), { foreignKey: 'botId' })
  }
  return Bot
}

export const createBotCommandModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const BotCommand = sequelizeClient.define<Model<BotCommandInterface>>(
    'bot-command',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
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
  ;(BotCommand as any).associate = (models: any): void => {
    ;(BotCommand as any).belongsTo(createBotModel(app), { foreignKey: 'botId' })
  }

  return BotCommand
}

export const createMessageModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const message = sequelizeClient.define<Model<MessageInterface>>(
    'message',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      text: {
        type: DataTypes.STRING(1023),
        allowNull: false
      },
      isNotification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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

  ;(message as any).associate = (models: any): any => {
    ;(message as any).belongsTo(models.channel, { allowNull: false })
    ;(message as any).belongsTo(createUserModel(app), { foreignKey: 'senderId', as: 'sender' })
  }

  return message
}

export const createChannelUserModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channelUser = sequelizeClient.define<Model<ChannelUserInterface>>(
    'channel-user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      isOwner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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

  ;(channelUser as any).associate = (models: any): void => {
    ;(channelUser as any).belongsTo(models.channel, { required: true, allowNull: false })
    ;(channelUser as any).belongsTo(createUserModel(app), { required: true, allowNull: false })
  }

  return channelUser
}

export const createInstanceModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instance = sequelizeClient.define<Model<InstanceInterface>>(
    'instance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      roomCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ipAddress: {
        type: DataTypes.STRING
      },
      channelId: {
        type: DataTypes.STRING
      },
      podName: {
        type: DataTypes.STRING
      },
      currentUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assignedAt: {
        type: DataTypes.DATE
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
  ;(instance as any).associate = (models: any): void => {
    ;(instance as any).belongsTo(createLocationModel(app), { foreignKey: { allowNull: true } })
    ;(instance as any).hasMany(createBotModel(app), { foreignKey: { allowNull: true } })
    ;(instance as any).belongsToMany(createUserModel(app), { through: 'instance-authorized-user' })
    ;(instance as any).hasMany(createInstanceAuthorizedUserModel(app), { foreignKey: { allowNull: false } })
    ;(instance as any).hasMany(createUserKickModel(app), { onDelete: 'cascade' })
  }
  return instance
}

export const createInstanceAuthorizedUserModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceAuthorizedUser = sequelizeClient.define<Model<InstanceAuthorizedUserInterface>>(
    'instance-authorized-user',
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

  ;(instanceAuthorizedUser as any).associate = (models: any): void => {
    ;(instanceAuthorizedUser as any).belongsTo(createInstanceModel(app), {
      required: true,
      foreignKey: { allowNull: true }
    })
    ;(instanceAuthorizedUser as any).belongsTo(createUserModel(app), {
      required: true,
      foreignKey: { allowNull: true }
    })
  }
  return instanceAuthorizedUser
}
