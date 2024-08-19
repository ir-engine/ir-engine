DROP PROCEDURE IF EXISTS `update_static_resource_history`;
CREATE PROCEDURE update_static_resource_history (
  IN projectName VARCHAR(255), 
  IN staticResourceId CHAR(36), 
  IN staticResourceType VARCHAR(255),
  IN oldURL VARCHAR(255), 
  IN newURL VARCHAR(255), 
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE projectId CHAR(36);
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);

  -- Find the project ID based on the project name
  SELECT `id` INTO projectId FROM `project` WHERE `name` = projectName;

  -- Determine the action type based on static-resource type, oldURL and newURL 
  IF oldURL <> newURL THEN
    IF staticResourceType = 'scene' THEN
      SET actionType = 'SCENE_RENAMED';
    ELSE
      SET actionType = 'RESOURCE_RENAMED';
    END IF;

    -- JSON object with old and new URL
    SET actionDetail = JSON_OBJECT(
      "oldURL", oldURL,
      "newURL", newURL
    );

  ELSE
    IF staticResourceType = 'scene' THEN
      SET actionType = 'SCENE_MODIFIED';
    ELSE
      SET actionType = 'RESOURCE_MODIFIED';
    END IF;

    SET actionDetail = JSON_OBJECT("url", newURL);
  END IF;

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
    actionType,
    staticResourceId,
    'static-resource',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_static_resource_update`;
CREATE TRIGGER after_static_resource_update
AFTER UPDATE ON `static-resource`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL update_static_resource_history(
    OLD.project,  -- projectName
    OLD.id,  -- staticResourceId
    OLD.type,  -- staticResourceType
    OLD.key,  -- oldKey
    NEW.key,  -- newKey
    NEW.updatedBy  -- updatedBy
  );
END;


DROP PROCEDURE IF EXISTS `insert_static_resource_history`;
CREATE PROCEDURE insert_static_resource_history (
  IN projectName VARCHAR(255), 
  IN staticResourceId CHAR(36), 
  IN staticResourceType VARCHAR(255),
  IN url VARCHAR(255), 
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE projectId CHAR(36);
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);

  -- Find the project ID based on the project name
  SELECT `id` INTO projectId FROM `project` WHERE `name` = projectName;

  -- Determine the action type based on static-resource type
  IF staticResourceType = 'scene' THEN
    SET actionType = 'SCENE_CREATED';
  ELSE
    SET actionType = 'RESOURCE_CREATED';
  END IF;

  -- JSON object with URL
  SET actionDetail = JSON_OBJECT("url", url);

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
    actionType,
    staticResourceId,
    'static-resource',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_static_resource_insert`;
CREATE TRIGGER after_static_resource_insert
AFTER INSERT ON `static-resource`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL insert_static_resource_history(
    NEW.project,  -- projectName
    NEW.id,  -- staticResourceId
    NEW.type,  -- staticResourceType
    NEW.key,  -- url
    NEW.updatedBy  -- updatedBy
  );
END;
