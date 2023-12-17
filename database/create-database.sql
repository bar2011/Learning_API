DROP DATABASE IF EXISTS `sql_database`;
CREATE DATABASE `sql_database`;
USE `sql_database`;

CREATE TABLE `courses` (
	`course_id` INT NOT NULL AUTO_INCREMENT,
	`course_title` VARCHAR(32) NOT NULL,
    `course_description` VARCHAR(256) DEFAULT NULL,
    `course_image` VARCHAR(256) NOT NULL,
    PRIMARY KEY (`course_id`)
);

CREATE TABLE `course_chapters` (
	`course_id` INT NOT NULL,
    `chapter_number` MEDIUMINT NOT NULL,
    `chapter_title` VARCHAR(32) NOT NULL,
    `chapter_image` VARCHAR(256) NOT NULL,
    `chapter_html` MEDIUMTEXT NOT NULL,
    PRIMARY KEY (`course_id`, `chapter_number`)
);

CREATE TABLE `course_answers` (
	`course_id` INT NOT NULL,
    `chapter_number` MEDIUMINT NOT NULL,
	`question_id` VARCHAR(16) NOT NULL,
	`answer_hash` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`course_id`, `chapter_number`, `question_id`)
);

CREATE TABLE `course_options` (
	`course_id` INT NOT NULL,
    `chapter_number` MEDIUMINT NOT NULL,
	`question_id` VARCHAR(16) NOT NULL,
	`question_option` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`course_id`, `chapter_number`, `question_id`)
);

CREATE TABLE `user_crad` (
    `email` VARCHAR(64) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `password_hash` VARCHAR(60) NOT NULL,
    PRIMARY KEY (`email`)
);

CREATE TABLE `user_progress` (
	`user_email` VARCHAR(64) NOT NULL,
    `course_id` INT NOT NULL,
    `current_chapter` MEDIUMINT UNSIGNED DEFAULT 1 NOT NULL,
    `current_section` MEDIUMINT UNSIGNED DEFAULT 1 NOT NULL,
    PRIMARY KEY (`user_email`, `course_id`)
);