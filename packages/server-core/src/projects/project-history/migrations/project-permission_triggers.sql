DROP PROCEDURE IF EXISTS `insert_project_permission_history`;
CREATE PROCEDURE insert_project_permission_history (
  IN projectId CHAR(36), 
  IN projectPermissionId CHAR(36),
  IN permissionType VARCHAR(255),
  IN givenTo CHAR(36),
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE actionDetail VARCHAR(600);
  DECLARE userName VARCHAR(255);

  -- Find the user name based on the user ID
  SELECT `name` INTO userName FROM `user` WHERE `id` = givenTo;

  -- JSON object with userName and permissionType
  SET actionDetail = JSON_OBJECT(
    "userName", userName,
    "userId", givenTo,
    "permissionType", permissionType
  );

  -- Insert the action into the project-history table
  INSERT INTO `project-history` (
    `id`, 
    `projectId`, 
    `userId`, 
    `action`, 
    `actionIdentifier`,
    `actionIdentifierType`, 
    `actionDetail`, 
    `createdAt`
  ) VALUES (
    UUID(),
    projectId,
    updatedBy,
    'PERMISSION_CREATED',
    projectPermissionId,
    'project-permission',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_project_permission_insert`;
CREATE TRIGGER after_project_permission_insert
AFTER INSERT ON `project-permission`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL insert_project_permission_history(
    NEW.projectId,  -- projectId
    NEW.id,  -- projectPermissionId
    NEW.type,  -- permissionType
    NEW.userId,  -- givenTo
    NEW.updatedBy  -- updatedBy
  );
END;

DROP PROCEDURE IF EXISTS `update_project_permission_history`;
CREATE PROCEDURE update_project_permission_history (
  IN projectId CHAR(36), 
  IN projectPermissionId CHAR(36),
  IN oldPermissionType VARCHAR(255),
  IN newPermissionType VARCHAR(255),
  IN givenTo CHAR(36),
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE actionDetail VARCHAR(600);
  DECLARE userName VARCHAR(255);

  -- Find the user name based on the user ID
  SELECT `name` INTO userName FROM `user` WHERE `id` = givenTo;

  -- JSON object with userName, oldPermissionType and newPermissionType
  SET actionDetail = JSON_OBJECT(
    "userName", userName,
    "userId", givenTo,
    "oldPermissionType", oldPermissionType,
    "newPermissionType", newPermissionType
  );

  -- Insert the action into the project-history table
  INSERT INTO `project-history` (
    `id`, 
    `projectId`, 
    `userId`, 
    `action`, 
    `actionIdentifier`,
    `actionIdentifierType`, 
    `actionDetail`, 
    `createdAt`
  ) VALUES (
    UUID(),
    projectId,
    updatedBy,
    'PERMISSION_MODIFIED',
    projectPermissionId,
    'project-permission',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_project_permission_update`;
CREATE TRIGGER after_project_permission_update
AFTER UPDATE ON `project-permission`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL update_project_permission_history(
    NEW.projectId,  -- projectId
    NEW.id,  -- projectPermissionId
    OLD.type,  -- oldPermissionType
    NEW.type,  -- newPermissionType
    NEW.userId,  -- givenTo
    NEW.updatedBy  -- updatedBy
  );
END;
