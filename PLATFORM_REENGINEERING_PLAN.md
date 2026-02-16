# Platform Workflow & Role Re-Engineering - Implementation Plan

## Overview

This document outlines the systematic refactoring of InsurAI to improve workflow clarity, role separation, and UI consistency.

## PHASE 1: Document Management Restructuring

### Backend Changes

- [ ] Remove document upload endpoints from user registration
- [ ] Remove document management from UserController
- [ ] Add document upload to ClaimController only
- [ ] Create ClaimDocumentRequest DTO
- [ ] Update Claim model to include document URLs

### Frontend Changes

- [ ] Remove Document Management section from UserDashboard
- [ ] Remove document upload from registration flow
- [ ] Add document upload UI to claim submission form
- [ ] Update MyClaims page with document upload

## PHASE 2: Policy Ownership & Company Management

### Backend Changes

- [ ] Create Company entity
- [ ] Create CompanyRepository
- [ ] Create CompanyService
- [ ] Create CompanyController
- [ ] Update Policy model to include Company reference
- [ ] Remove policy CRUD from AdminController
- [ ] Create policy management endpoints for COMPANY role

### Frontend Changes

- [ ] Create CompanyDashboard component
- [ ] Create CompanyPolicyManagement component
- [ ] Remove policy management from AdminDashboard
- [ ] Update policy cards to show company information
- [ ] Create company login flow

## PHASE 3: Super Admin Governance

### Backend Changes

- [ ] Create SUPER_ADMIN role
- [ ] Create SuperAdminController
- [ ] Add company approval workflow
- [ ] Add company/policy enable/disable endpoints
- [ ] Create audit log system
- [ ] Add compliance monitoring endpoints

### Frontend Changes

- [ ] Create SuperAdminDashboard component
- [ ] Create CompanyApproval component
- [ ] Create SystemAuditLog component
- [ ] Create ComplianceMonitor component
- [ ] Add super admin navigation

## PHASE 4: UI Consistency

### Design System

- [ ] Create standardized Card component with variants
- [ ] Define consistent spacing tokens
- [ ] Create action button layouts
- [ ] Standardize typography scale
- [ ] Create animation library

### Component Updates

- [ ] Refactor all dashboard cards
- [ ] Standardize policy listing cards
- [ ] Standardize agent cards
- [ ] Standardize appointment cards
- [ ] Update all action buttons

## Database Schema Changes

```sql
-- New Company table
CREATE TABLE company (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Update Policy table
ALTER TABLE policy ADD COLUMN company_id BIGINT;
ALTER TABLE policy ADD FOREIGN KEY (company_id) REFERENCES company(id);

-- Update User table for roles
-- Add COMPANY and SUPER_ADMIN to role enum

-- Claim documents
ALTER TABLE claim ADD COLUMN document_urls TEXT;
```

## Role Hierarchy

```
SUPER_ADMIN
    ├── Approve/Reject Companies
    ├── Monitor All Activities
    ├── Emergency Policy Control
    └── System Analytics

COMPANY
    ├── Manage Own Policies
    ├── View Policy Analytics
    └── Update Policy Status

ADMIN
    ├── View Policies (Read-only)
    ├── Manage Users
    ├── View System Activity
    └── Monitor Agents

AGENT
    ├── Handle Consultations
    ├── Process Claims
    └── Recommend Policies

USER
    ├── Browse Policies
    ├── Book Appointments
    ├── Submit Claims (with documents)
    └── Purchase Policies
```

## Implementation Order

1. **Phase 2 First** (Company & Policy Ownership)
   - Create Company infrastructure
   - Migrate policy management
   - Update admin restrictions

2. **Phase 3** (Super Admin)
   - Add governance layer
   - Implement approval workflows

3. **Phase 1** (Document Management)
   - Remove user document management
   - Add claim-specific uploads

4. **Phase 4** (UI Consistency)
   - Create design system
   - Refactor all components

## Testing Strategy

- [ ] Unit tests for new services
- [ ] Integration tests for role permissions
- [ ] E2E tests for company workflow
- [ ] UI regression tests for card layouts
- [ ] Security tests for role-based access

## Migration Strategy

1. Create Company accounts for existing policies
2. Assign orphaned policies to default company
3. Migrate admin users to appropriate roles
4. Update existing claims with document structure

## Rollback Plan

- Keep old endpoints deprecated but functional
- Feature flags for new role system
- Database migration scripts with rollback
- Gradual frontend migration with fallbacks

---

**Status**: Planning Complete
**Next Step**: Begin Phase 2 Implementation
