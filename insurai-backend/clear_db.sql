SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_log;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE agent_review;
TRUNCATE TABLE feedback;
TRUNCATE TABLE claim;
TRUNCATE TABLE claim_document_urls;
TRUNCATE TABLE user_company_map;
TRUNCATE TABLE user_policy_alternative_policy_ids;
TRUNCATE TABLE user_policy;
TRUNCATE TABLE booking_suggested_alternative_policy_ids;
TRUNCATE TABLE booking;
TRUNCATE TABLE appointment;
TRUNCATE TABLE appointment_seq;
TRUNCATE TABLE booking_seq;
TRUNCATE TABLE policy_exclusions;
TRUNCATE TABLE policy_warnings;
TRUNCATE TABLE policy;
TRUNCATE TABLE user_assigned_regions;
TRUNCATE TABLE user_assigned_policy_types;
TRUNCATE TABLE company;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'CLEARED' AS result;
