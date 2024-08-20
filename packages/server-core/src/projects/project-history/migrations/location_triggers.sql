DROP PROCEDURE IF EXISTS `update_location_history`;
CREATE PROCEDURE update_location_history (
  IN projectId CHAR(36),
  IN locationId CHAR(36),
  IN locationSlugifiedName VARCHAR(255),
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE actionDetail VARCHAR(600);

  -- JSON object with location name
  SET actionDetail = JSON_OBJECT("locationName", locationSlugifiedName);

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
    'LOCATION_MODIFIED',
    locationId,
    'location',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_location_update`;
CREATE TRIGGER after_location_update
AFTER UPDATE ON `location`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL update_location_history(
    NEW.projectId,  -- projectName
    NEW.id,  -- locationId
    NEW.slugifiedName, -- locationSlugifiedName
    NEW.updatedBy  -- updatedBy
  );
END;


DROP PROCEDURE IF EXISTS `insert_location_history`;
CREATE PROCEDURE insert_location_history (
  IN projectId CHAR(36),
  IN locationId CHAR(36),
  IN locationSlugifiedName VARCHAR(255),
  IN sceneId CHAR(36),
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE sceneURL VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);

  -- Find the scene name based on the scene ID
  SELECT `key` INTO sceneURL FROM `static-resource` WHERE `id` = sceneId;

  -- JSON object with location name, scene URL, and scene ID
  SET actionDetail = JSON_OBJECT(
    "locationName", locationSlugifiedName,
    "sceneURL", sceneURL,
    "sceneId", sceneId
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
    'LOCATION_PUBLISHED',
    locationId,
    'location',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_location_insert`;
CREATE TRIGGER after_location_insert
AFTER INSERT ON `location`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL insert_location_history(
    NEW.projectId,  -- projectName
    NEW.id,  -- locationId
    NEW.slugifiedName, -- locationSlugifiedName
    NEW.sceneId,  -- sceneId
    NEW.updatedBy  -- updatedBy
  );
END;
