DROP TABLE IF EXISTS `template`;

CREATE TABLE
  template (
    id INT UNSIGNED PRIMARY KEY auto_increment NOT NULL,
    uuid char(32) UNIQUE NULL,
    `name` varchar(100) NULL COMMENT '名称',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    is_deleted TINYINT DEFAULT 0 NULL,
    deleted_time DATETIME NULL
  ) COMMENT = '模板表';