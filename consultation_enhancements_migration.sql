-- ============================================
-- Consultation, Communication & Feedback Enhancements
-- Database Migration Script
-- Version: 1.0
-- Date: 2026-02-12
-- ============================================

-- ============================================
-- PHASE 3: Agent Review System
-- ============================================

CREATE TABLE IF NOT EXISTS agent_review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_booking_review UNIQUE (booking_id),
    
    INDEX idx_review_agent (agent_id),
    INDEX idx_review_booking (booking_id),
    INDEX idx_review_user (user_id),
    INDEX idx_review_rating (rating),
    INDEX idx_review_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PHASE 4: User Feedback System
-- ============================================

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,
    assigned_to BIGINT,
    admin_response VARCHAR(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_feedback_user (user_id),
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_category (category),
    INDEX idx_feedback_assigned (assigned_to),
    INDEX idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Verification Queries
-- ============================================

-- Verify agent_review table
SELECT 'Agent Review table created' AS status, COUNT(*) AS count FROM agent_review;

-- Verify feedback table
SELECT 'Feedback table created' AS status, COUNT(*) AS count FROM feedback;

-- Show table structures
DESCRIBE agent_review;
DESCRIBE feedback;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Note: Uncomment below to insert sample data for testing

/*
-- Sample agent review (requires existing booking, agent, and user IDs)
INSERT INTO agent_review (booking_id, agent_id, user_id, rating, feedback)
VALUES (1, 2, 3, 5, 'Excellent service! Very knowledgeable and helpful.');

-- Sample feedback
INSERT INTO feedback (user_id, category, subject, description, status)
VALUES 
(3, 'QUERY', 'Question about policy coverage', 'I would like to know if my policy covers dental procedures.', 'OPEN'),
(4, 'BUG', 'Unable to upload documents', 'The document upload button is not working on the claims page.', 'OPEN'),
(5, 'SUGGESTION', 'Mobile app feature', 'It would be great to have a mobile app for easier access.', 'OPEN');
*/

-- ============================================
-- Rollback Script (Emergency Use Only)
-- ============================================

-- CAUTION: This will remove all review and feedback data
-- Only use if you need to rollback the migration

/*
DROP TABLE IF EXISTS agent_review;
DROP TABLE IF EXISTS feedback;
*/

-- ============================================
-- Migration Complete
-- ============================================

SELECT '✅ Consultation enhancements migration completed successfully!' AS status;
SELECT 'Tables created: agent_review, feedback' AS tables_created;
