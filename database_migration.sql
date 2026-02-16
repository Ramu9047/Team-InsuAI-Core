-- ============================================
-- InsurAI Platform Re-Engineering
-- Database Migration Script
-- Version: 2.0
-- Date: 2026-02-12
-- ============================================

-- ============================================
-- PHASE 1: Create Company Table
-- ============================================

CREATE TABLE IF NOT EXISTS company (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL' NOT NULL,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NULL,
    logo_url VARCHAR(255),
    primary_color VARCHAR(7),
    CONSTRAINT fk_company_approved_by FOREIGN KEY (approved_by) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_company_email (email),
    INDEX idx_company_status (status),
    INDEX idx_company_active (is_active),
    INDEX idx_company_registration (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PHASE 2: Update Policy Table
-- ============================================

-- Add company_id column to policy table
ALTER TABLE policy 
ADD COLUMN company_id BIGINT NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE policy
ADD CONSTRAINT fk_policy_company 
FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE SET NULL;

-- Add index for better query performance
ALTER TABLE policy
ADD INDEX idx_policy_company (company_id);

-- ============================================
-- PHASE 3: Update Claim Table
-- ============================================

-- Add claim_type column for dynamic document requirements
ALTER TABLE claim
ADD COLUMN claim_type VARCHAR(100) NULL AFTER policy_name;

-- Add index for claim type filtering
ALTER TABLE claim
ADD INDEX idx_claim_type (claim_type);

-- ============================================
-- PHASE 4: Update User Table (Role Enum)
-- ============================================

-- Note: If using enum in database, update it
-- If role is VARCHAR, this is handled in application code

-- For MySQL enum (if applicable):
-- ALTER TABLE user MODIFY COLUMN role ENUM('USER', 'AGENT', 'ADMIN', 'COMPANY', 'SUPER_ADMIN') NOT NULL;

-- For VARCHAR (recommended):
-- No database change needed, handled in Java enum

-- ============================================
-- PHASE 5: Create Audit Log Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PHASE 6: Data Migration
-- ============================================

-- Create a default "Legacy" company for existing policies without company
INSERT INTO company (name, email, password, registration_number, status, is_active, description)
VALUES (
    'Legacy Insurance Co.',
    'legacy@insurai.system',
    '$2a$10$dummyHashForSystemAccount',
    'LEGACY-001',
    'APPROVED',
    TRUE,
    'System-generated company for migrating existing policies'
);

-- Get the ID of the legacy company
SET @legacy_company_id = LAST_INSERT_ID();

-- Assign all existing policies without company to legacy company
UPDATE policy 
SET company_id = @legacy_company_id 
WHERE company_id IS NULL;

-- ============================================
-- PHASE 7: Create Initial Super Admin (MANUAL)
-- ============================================

-- IMPORTANT: Replace with actual bcrypt hashed password
-- This is just a template - DO NOT use in production as-is

-- INSERT INTO user (name, email, password, role, phone, address)
-- VALUES (
--     'Super Administrator',
--     'superadmin@insurai.com',
--     '$2a$10$YOUR_BCRYPT_HASHED_PASSWORD_HERE',
--     'SUPER_ADMIN',
--     '+1234567890',
--     'System'
-- );

-- ============================================
-- PHASE 8: Verification Queries
-- ============================================

-- Verify company table
SELECT 'Company table created' AS status, COUNT(*) AS count FROM company;

-- Verify policy-company relationship
SELECT 
    'Policies with company' AS status,
    COUNT(*) AS total_policies,
    COUNT(company_id) AS policies_with_company,
    COUNT(*) - COUNT(company_id) AS policies_without_company
FROM policy;

-- Verify claim type column
SELECT 'Claim type column' AS status, COUNT(*) AS total_claims FROM claim;

-- Show company statistics
SELECT 
    status,
    COUNT(*) AS count,
    GROUP_CONCAT(name SEPARATOR ', ') AS companies
FROM company
GROUP BY status;

-- ============================================
-- PHASE 9: Rollback Script (Emergency Use Only)
-- ============================================

-- CAUTION: This will remove all re-engineering changes
-- Only use if you need to rollback the migration

/*
-- Remove foreign key constraints
ALTER TABLE policy DROP FOREIGN KEY fk_policy_company;
ALTER TABLE audit_log DROP FOREIGN KEY fk_audit_user;
ALTER TABLE company DROP FOREIGN KEY fk_company_approved_by;

-- Remove indexes
ALTER TABLE policy DROP INDEX idx_policy_company;
ALTER TABLE claim DROP INDEX idx_claim_type;

-- Remove columns
ALTER TABLE policy DROP COLUMN company_id;
ALTER TABLE claim DROP COLUMN claim_type;

-- Drop tables
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS company;

-- Note: User role changes must be handled in application code
*/

-- ============================================
-- PHASE 10: Post-Migration Tasks
-- ============================================

-- TODO: Update SecurityConfig.java to include new roles
-- TODO: Create SUPER_ADMIN user manually with proper password
-- TODO: Test company registration flow
-- TODO: Test super admin approval workflow
-- TODO: Verify policy ownership constraints
-- TODO: Update frontend routes for new dashboards

-- ============================================
-- Migration Complete
-- ============================================

SELECT '✅ Database migration completed successfully!' AS status;
SELECT 'Next steps: Create SUPER_ADMIN user and update application configuration' AS next_action;
