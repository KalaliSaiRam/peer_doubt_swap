-- ============================================================
-- Peer Doubt Swap — Database Setup
-- Run this SQL in phpMyAdmin (http://localhost/phpmyadmin)
-- Step 1: Create the database (if not exists)
-- Step 2: Select it, then run the CREATE TABLE statements
-- ============================================================

CREATE DATABASE IF NOT EXISTS peer_doubt_swap;
USE peer_doubt_swap;

-- ── Users Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  dob           DATE         DEFAULT NULL,
  gender        VARCHAR(10)  DEFAULT NULL,
  is_student    TINYINT(1)   DEFAULT 0,
  college_name  VARCHAR(200) DEFAULT NULL,
  passout_year  VARCHAR(4)   DEFAULT NULL,
  branch        VARCHAR(100) DEFAULT NULL,
  stars         INT          DEFAULT 0,
  level         VARCHAR(20)  DEFAULT 'Bronze',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Doubts Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doubts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  subject    VARCHAR(50)  NOT NULL,
  difficulty VARCHAR(10)  NOT NULL,
  question   TEXT         NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Comments (Solutions) Table ───────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  doubt_id   INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- ── Stars Log (tracks who gave stars to whom) ────────────────
CREATE TABLE IF NOT EXISTS stars_log (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT NOT NULL,
  to_user_id   INT NOT NULL,
  comment_id   INT NOT NULL,
  doubt_id     INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id)   REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (doubt_id)     REFERENCES doubts(id) ON DELETE CASCADE
);
