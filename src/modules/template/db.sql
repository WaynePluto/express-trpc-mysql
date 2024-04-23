DROP TABLE IF EXISTS `template`;

CREATE TABLE
  template (
    id INT UNSIGNED PRIMARY KEY auto_increment NOT NULL,
    uuid char(32) UNIQUE NULL,
    `name` varchar(100) NULL COMMENT '名称',
  ) COMMENT = '模板表';

-- 通用字段
ALTER TABLE template
ADD COLUMN create_time DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
ADD COLUMN is_delete TINYINT DEFAULT 0 NOT NULL,
ADD COLUMN delete_time DATETIME NULL;