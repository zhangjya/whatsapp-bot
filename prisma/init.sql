
-- CreateTable
CREATE TABLE robot (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    mobile VARCHAR(20),
    name VARCHAR(20) COMMENT '自定义名称',
    nick_name VARCHAR(20),
    status INTEGER NOT NULL DEFAULT 0 COMMENT '状态， -1 表示删除，0表示未授权，1表示等待扫码，2表示授权中，3表示已授权'
);

-- CreateTable
CREATE TABLE white_list (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    robot_id INT NOT NULL COMMENT '机器人id',
    account VARCHAR(20) NOT NULL COMMENT '账号',
    permission VARCHAR(20) NOT NULL DEFAULT 'js/qz/ch' COMMENT '权限，js/qz/ch',
    status INTEGER NOT NULL DEFAULT 1 COMMENT '状态，-1 表示删除，0表示禁用，1表示启用'
);

-- CreateTable
CREATE TABLE `group` (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    unique_id VARCHAR(200) UNIQUE NOT NULL COMMENT '唯一id, robotId_groupId 拼接而成',
    robot_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    group_id VARCHAR(100) NOT NULL COMMENT 'whatsapp 的群组id',
    total_amount FLOAT NOT NULL DEFAULT 0 COMMENT '总金额',
    status INTEGER NOT NULL DEFAULT 1 COMMENT '群组状态，-1 表示删除 0表示禁用 1表示启用'
);

-- CreateTable
CREATE TABLE bills (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    robot_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL COMMENT 'group 表的 自增长id',
    math_str VARCHAR(500) NOT NULL COMMENT '数学表达式 +1+2*3',
    amount FLOAT NOT NULL COMMENT '记账金额',
    current_amount FLOAT NOT NULL COMMENT '当前总金额'
);

-- CreateTable
CREATE TABLE bills_history (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL,
    robot_id INTEGER NOT NULL COMMENT '机器人id',
    group_id INTEGER NOT NULL COMMENT 'group 表的 自增长id',
    math_str VARCHAR(500) NOT NULL COMMENT '数学表达式 +1+2*3',
    amount FLOAT NOT NULL COMMENT '记账金额',
    current_amount FLOAT NOT NULL COMMENT '当前总金额',
    billing_batch_no VARCHAR(100) NOT NULL COMMENT '账单批次号'
);
