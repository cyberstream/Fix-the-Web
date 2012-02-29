<?php
require 'db.php';

if ($db) {
    // create tables if they don't exist yet
    
    $db->query("CREATE TABLE IF NOT EXISTS `reports` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `report_id` int(11) DEFAULT NULL COMMENT 'If this is a comment, then this field should be the id of the report the comment is for',
    `username` varchar(128) NOT NULL COMMENT 'The user''s Opera username',
    `language` char(2) DEFAULT NULL COMMENT 'Two-character abbreviation for the language of this comment',
    `category` tinyint(1) DEFAULT NULL COMMENT '1 => minor annoyance; 2 => major problem; 3 => site unusable',
    `report` text NOT NULL COMMENT 'The content of the report or comment',
    `page` varchar(510) DEFAULT NULL COMMENT 'The full URL of the page the error was reported about. NULL in comments',
    `domain` varchar(255) DEFAULT NULL COMMENT 'The domain name of the site which the error report was submitted from; NULL in comments',
    `opera_version` varchar(10) NOT NULL COMMENT 'opera.version()',
    `opera_build` varchar(10) NOT NULL COMMENT 'opera.buildNumber()',
    `operating_system` varchar(64) DEFAULT NULL COMMENT 'The information about the operating system of the commenter or reporter',
    `additional_information` text COMMENT 'Other information about the user''s system, e.g. plugins, screen resolution and size, etc',
    `post_type` tinyint(1) NOT NULL COMMENT '0 => an error report; 1 => is a comment, not a correction or solution; 2 => a comment, not a correction, is a solution; 3 => a comment, is a correction, but not a solution; 4 => a comment, is a correction and a solution',
    `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `page` (`page`(255),`post_type`)
    ) ENGINE=InnoDB;") or die('The reports table was not created. Please try again.');
    
    $db->query("CREATE TABLE IF NOT EXISTS `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_foreign_key` int(11) NOT NULL COMMENT 'links this row to the report or comment in the reports table',
  `username` varchar(128) NOT NULL,
  `is_read` tinyint(1) NOT NULL COMMENT '0 => not read, 1 => is read',
  `rating` tinyint(1) NOT NULL COMMENT '-1 => rate comment down; 0 => this is a subscription, not a rating; 1 => rate comment up',
  PRIMARY KEY (`id`),
  KEY `id_foreign_key` (`id_foreign_key`,`is_read`),
  KEY `rating` (`rating`)
) ENGINE=InnoDB;") or die('The ratings table could not be created. Please try again.');
}
