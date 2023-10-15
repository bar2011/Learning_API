DROP DATABASE IF EXISTS `sql_learning_api`;
CREATE DATABASE `sql_learning_api`;
USE `sql_learning_api`;

CREATE TABLE `courses` (
	`course_id` INT NOT NULL AUTO_INCREMENT,
	`course_title` VARCHAR(16) NOT NULL,
    `course_description` VARCHAR(1024) DEFAULT NULL,
    `current_div` SMALLINT UNSIGNED DEFAULT 1 NOT NULL,
    `current_progress` MEDIUMINT UNSIGNED DEFAULT 1 NOT NULL,
    `course_html` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`course_id`)
);

CREATE TABLE `course_answers` (
	`course_id` INT NOT NULL,
	`question_id` VARCHAR(16) NOT NULL,
	`answer_hash` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`course_id`, `question_id`)
);

CREATE TABLE `course_options` (
	`course_id` INT NOT NULL,
	`question_id` VARCHAR(16) NOT NULL,
	`question_option` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`course_id`, `question_id`)
);