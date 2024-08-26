DROP PROCEDURE IF EXISTS `handle_thumbnails`;
CREATE PROCEDURE handle_thumbnails (
  IN projectId CHAR(36), 
  IN staticResourceId CHAR(36), 
  IN resourceURL VARCHAR(255),
  IN oldThumbnailURL VARCHAR(255),
  IN newThumbnailURL VARCHAR(255),
  IN updatedBy CHAR(36)
)
BEGIN
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);
  DECLARE insertRow BOOLEAN;

  IF oldThumbnailURL IS NULL AND newThumbnailURL IS NOT NULL THEN
    SET actionType = 'THUMBNAIL_CREATED';
    SET actionDetail = JSON_OBJECT("thumbnailURL", newThumbnailURL, "url", resourceURL);
    SET insertRow = TRUE;
  ELSEIF oldThumbnailURL IS NOT NULL AND newThumbnailURL IS NULL THEN
    SET actionType = 'THUMBNAIL_DELETED';
    SET actionDetail = JSON_OBJECT("url", resourceURL);
    SET insertRow = TRUE;
  ELSEIF oldThumbnailURL IS NOT NULL AND newThumbnailURL IS NOT NULL AND oldThumbnailURL <> newThumbnailURL THEN
    SET actionType = 'THUMBNAIL_MODIFIED';
    SET actionDetail = JSON_OBJECT(
      "oldThumbnailURL", oldThumbnailURL,
      "newThumbnailURL", newThumbnailURL,
      "url", resourceURL
    );
    SET insertRow = TRUE;
  END IF;

  IF insertRow THEN
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
  END IF;
END;

DROP PROCEDURE IF EXISTS `handle_tags`;
CREATE PROCEDURE handle_tags (
  IN projectId CHAR(36), 
  IN staticResourceId CHAR(36), 
  IN resourceURL VARCHAR(255),
  IN oldTags LONGTEXT,
  IN newTags LONGTEXT,
  IN updatedBy CHAR(36)
)
BEGIN
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);
  DECLARE insertRow BOOLEAN;

  IF oldTags <> newTags THEN
    SET actionType = 'TAGS_MODIFIED';
    SET actionDetail = JSON_OBJECT("url", resourceURL);
    SET insertRow = TRUE;
  END IF;

  IF insertRow THEN
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
  END IF;
END;


DROP PROCEDURE IF EXISTS `update_static_resource_history`;
CREATE PROCEDURE update_static_resource_history (
  IN projectId CHAR(36), 
  IN staticResourceId CHAR(36), 
  IN staticResourceType VARCHAR(255),
  IN oldURL VARCHAR(255), 
  IN newURL VARCHAR(255), 
  IN updatedBy CHAR(36)
)
sp: BEGIN
  
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);

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
tr: BEGIN
  DECLARE projectId CHAR(36);

  IF NEW.type = 'thumbnail' THEN
    -- No need to log the thumbnail resource update, because it is handled by the parent resource update
    LEAVE tr;
  END IF;

  -- Find the project ID based on the project name
  SELECT `id` INTO projectId FROM `project` WHERE `name` = NEW.project;

  CALL handle_thumbnails(
    projectId,  -- projectId
    OLD.id,  -- staticResourceId
    NEW.key,  -- resourceURL
    OLD.thumbnailKey,  -- oldThumbnailURL
    NEW.thumbnailKey,  -- newThumbnailURL
    NEW.updatedBy  -- updatedBy
  );

  CALL handle_tags(
    projectId,  -- projectId
    OLD.id,  -- staticResourceId
    NEW.key,  -- resourceURL
    OLD.tags,  -- oldTags
    NEW.tags,  -- newTags
    NEW.updatedBy  -- updatedBy
  );

  IF (OLD.hash <> NEW.hash) OR
    (OLD.key <> NEW.key) OR
    (OLD.mimeType <> NEW.mimeType) OR
    (OLD.project <> NEW.project) OR
    (OLD.licensing <> NEW.licensing) OR
    (OLD.attribution <> NEW.attribution) OR
    (OLD.stats <> NEW.stats) OR
    (OLD.userId <> NEW.userId) OR
    (OLD.type <> NEW.type) OR
    (OLD.dependencies <> NEW.dependencies) OR
    (OLD.description <> NEW.description) THEN

    -- Call the stored procedure with the necessary parameters
    CALL update_static_resource_history(
      projectId,  -- projectId
      NEW.id,  -- staticResourceId
      NEW.type,  -- staticResourceType
      OLD.key,  -- oldKey
      NEW.key,  -- newKey
      NEW.updatedBy  -- updatedBy
    );
  END IF;
END;


DROP PROCEDURE IF EXISTS `insert_static_resource_history`;
CREATE PROCEDURE insert_static_resource_history (
  IN projectId CHAR(36), 
  IN staticResourceId CHAR(36), 
  IN staticResourceType VARCHAR(255),
  IN url VARCHAR(255), 
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE actionType VARCHAR(255);
  DECLARE actionDetail VARCHAR(600);

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
sp: BEGIN
  DECLARE projectId CHAR(36);

  IF NEW.type = 'thumbnail' THEN
    -- No need to log the thumbnail resource insert, because it is handled by the parent resource
    LEAVE sp;
  END IF;

  -- Find the project ID based on the project name
  SELECT `id` INTO projectId FROM `project` WHERE `name` = NEW.project;

  -- Call the stored procedure with the necessary parameters
  CALL insert_static_resource_history(
    projectId,  -- projectName
    NEW.id,  -- staticResourceId
    NEW.type,  -- staticResourceType
    NEW.key,  -- url
    NEW.updatedBy  -- updatedBy
  );

  IF NEW.tags IS NOT NULL THEN
    CALL handle_tags(
      projectId,  -- projectId
      NEW.id,  -- staticResourceId
      NEW.key,  -- resourceURL
      NULL,  -- oldTags
      NEW.tags,  -- newTags
      NEW.updatedBy  -- updatedBy
    );
  END IF;

  IF NEW.thumbnailKey IS NOT NULL THEN
    CALL handle_thumbnails(
      projectId,  -- projectId
      NEW.id,  -- staticResourceId
      NEW.key, -- resourceURL
      NULL,  -- oldThumbnailURL
      NEW.thumbnailKey,  -- newThumbnailURL
      NEW.updatedBy  -- updatedBy
    );
  END IF;
END;
