-- Run once on existing databases (e.g. Railway MySQL) if users table was created before this column existed.
ALTER TABLE users
  ADD COLUMN notifications_last_read_at TIMESTAMP NULL DEFAULT NULL
  AFTER level;
