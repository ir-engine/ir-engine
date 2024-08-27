DROP PROCEDURE IF EXISTS `insert_project_history`;
CREATE PROCEDURE insert_project_history (
  IN projectId CHAR(36),
  IN projectName VARCHAR(255),
  IN updatedBy CHAR(36)
)
sp: BEGIN
  DECLARE actionDetail VARCHAR(600);

  -- JSON object with project name, scene URL, and scene ID
  SET actionDetail = JSON_OBJECT("projectName", projectName);

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
    'PROJECT_CREATED',
    projectId,
    'project',
    actionDetail,
    NOW()
  );
END;

DROP TRIGGER IF EXISTS `after_project_insert`;
CREATE TRIGGER after_project_insert
AFTER INSERT ON `project`
FOR EACH ROW
BEGIN
  -- Call the stored procedure with the necessary parameters
  CALL insert_project_history(
    NEW.id,  -- projectId
    NEW.name, -- projectName
    NEW.updatedBy  -- updatedBy
  );
END;
