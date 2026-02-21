-- ================================================================
-- InsuAI: Full Database Clear Script
-- Deletes all application data in dependency-safe order.
-- DataSeeder will repopulate on next backend startup.
-- ================================================================

USE insurai_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Audit logs (no children)
TRUNCATE TABLE audit_log;

-- Feedback
TRUNCATE TABLE feedback;

-- Claims
TRUNCATE TABLE claim;

-- User-Company maps
TRUNCATE TABLE user_company_map;

-- UserPolicy element collections
TRUNCATE TABLE user_policy_alternative_policy_ids;

-- User policies
TRUNCATE TABLE user_policy;

-- Bookings
TRUNCATE TABLE booking;

-- Policy element collections
TRUNCATE TABLE policy_exclusions;
TRUNCATE TABLE policy_warnings;

-- Policies
TRUNCATE TABLE policy;

-- Agent regions / policy types (element collections on User)
TRUNCATE TABLE user_assigned_regions;
TRUNCATE TABLE user_assigned_policy_types;

-- Companies
TRUNCATE TABLE company;

-- Users (last - everything references this)
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables cleared. Restart backend to reseed.' AS status;
