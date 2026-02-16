# Platform Re-Engineering - Progress Report

## 🎯 Project Overview

This is a **major architectural refactoring** of the InsurAI platform involving:

- New role hierarchy (COMPANY, SUPER_ADMIN)
- Policy ownership model
- Document management restructuring
- UI/UX consistency enforcement

**Estimated Effort**: 40-60 hours of development
**Complexity**: High
**Risk**: Medium (requires careful migration)

---

## ✅ Completed Work

### Phase 2: Company & Policy Ownership (Started)

#### Backend - Models

- ✅ Created `Company.java` entity with:
  - Company profile fields (name, email, registration number)
  - Approval workflow (status, approvedBy, approvedAt)
  - Branding (logoUrl, primaryColor)
  - Active/inactive status management

- ✅ Updated `Policy.java` model:
  - Added `Company` reference (ManyToOne relationship)
  - Added getters/setters for company field

#### Backend - Repository

- ✅ Created `CompanyRepository.java` with:
  - Find by email
  - Find by status
  - Find by active state
  - Existence checks

---

## 📋 Remaining Work

### Phase 2: Company & Policy Ownership (In Progress)

#### Backend - Remaining Tasks

- [ ] Create `CompanyService.java`
  - Company registration
  - Company login/authentication
  - Policy CRUD for companies
  - Company profile management

- [ ] Create `CompanyController.java`
  - `/api/company/register` - Company registration
  - `/api/company/login` - Company authentication
  - `/api/company/policies` - Manage policies
  - `/api/company/profile` - Update company info

- [ ] Update `User.java` model
  - Add COMPANY role to enum
  - Add SUPER_ADMIN role to enum

- [ ] Update `SecurityConfig.java`
  - Add COMPANY role permissions
  - Configure company endpoints

- [ ] Remove policy management from `AdminController.java`
  - Keep read-only access
  - Remove create/update/delete endpoints

#### Frontend - Remaining Tasks

- [ ] Create `CompanyDashboard.js`
  - Company profile overview
  - Policy management interface
  - Analytics dashboard

- [ ] Create `CompanyPolicyManagement.js`
  - Add new policy form
  - Edit existing policies
  - Policy status management (Active/Suspended/Expired)

- [ ] Create `CompanyLogin.js`
  - Separate login page for companies
  - Company registration flow

- [ ] Update `AdminDashboard.js`
  - Remove policy management section
  - Keep read-only policy viewing
  - Update navigation

- [ ] Update policy cards across app
  - Display company name/logo
  - Show company branding

---

### Phase 3: Super Admin Governance (Not Started)

#### Backend Tasks

- [ ] Create `SuperAdminController.java`
  - Company approval endpoints
  - System monitoring endpoints
  - Emergency policy control

- [ ] Create `AuditLog.java` entity
  - Track all system changes
  - Company actions
  - Policy modifications

- [ ] Create `ComplianceMonitor.java` service
  - Automated compliance checks
  - Suspicious activity detection

#### Frontend Tasks

- [ ] Create `SuperAdminDashboard.js`
  - Pending company approvals
  - System-wide analytics
  - Compliance alerts

- [ ] Create `CompanyApprovalPanel.js`
  - Review company applications
  - Approve/reject with reasons
  - View company details

- [ ] Create `SystemAuditLog.js`
  - Searchable audit trail
  - Filter by entity/action
  - Export capabilities

---

### Phase 1: Document Management (Not Started)

#### Backend Tasks

- [ ] Update `Claim.java` model
  - Add `documentUrls` field (JSON or ElementCollection)
  - Remove general document management

- [ ] Update `ClaimController.java`
  - Add document upload endpoint
  - Validate document types
  - Associate documents with claims only

- [ ] Remove document endpoints from `UserController.java`

#### Frontend Tasks

- [ ] Update `UserDashboard.js`
  - Remove Document Management section completely

- [ ] Update `MyClaims.js`
  - Add document upload UI
  - Show uploaded documents
  - Validate file types/sizes

- [ ] Update `SubmitClaim.js` (or create if doesn't exist)
  - Integrated document upload
  - Dynamic document requirements based on claim type

---

### Phase 4: UI Consistency (Not Started)

#### Design System

- [ ] Create `StandardCard.js` component
  - Variants: policy, agent, appointment, claim
  - Consistent sizing and spacing
  - Standardized action buttons

- [ ] Create `design-tokens.css`
  - Spacing scale
  - Typography scale
  - Color palette
  - Shadow system

- [ ] Create `animations.css`
  - Standard transitions
  - Hover effects
  - Loading states

#### Component Refactoring

- [ ] Refactor all dashboard cards
  - `UserDashboard.js`
  - `AgentDashboard.js`
  - `AdminDashboard.js`

- [ ] Standardize policy listings
  - `Plans.js`
  - `PlansEnhanced.js`
  - `MyPolicies.js`

- [ ] Standardize agent cards
  - `AgentRequests.js`
  - `AgentConsultations.js`

- [ ] Standardize appointment cards
  - `MyBookings.js`
  - `AgentAppointmentsEnhanced.js`
  - `MyAppointmentsEnhanced.js`

---

## 🗄️ Database Migration Required

```sql
-- Add Company table
CREATE TABLE company (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    logo_url VARCHAR(255),
    primary_color VARCHAR(7),
    FOREIGN KEY (approved_by) REFERENCES user(id)
);

-- Update Policy table
ALTER TABLE policy ADD COLUMN company_id BIGINT;
ALTER TABLE policy ADD FOREIGN KEY (company_id) REFERENCES company(id);

-- Update User table (if using enum, update application code)
-- Add 'COMPANY' and 'SUPER_ADMIN' to role enum

-- Update Claim table
ALTER TABLE claim ADD COLUMN document_urls TEXT;
```

---

## 📊 Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Document Management | Not Started | 0% |
| Phase 2: Company & Policy | In Progress | 15% |
| Phase 3: Super Admin | Not Started | 0% |
| Phase 4: UI Consistency | Not Started | 0% |
| **Overall** | **In Progress** | **~5%** |

---

## ⚠️ Important Considerations

### Breaking Changes

This refactoring introduces **breaking changes**:

1. Existing policies need company assignment
2. Admin users lose policy management rights
3. Document upload flow changes completely
4. New authentication flows for companies

### Migration Strategy

1. **Create default company** for existing policies
2. **Migrate admin users** - decide who becomes SUPER_ADMIN
3. **Update existing claims** - structure document references
4. **Gradual rollout** - use feature flags

### Testing Requirements

- [ ] Unit tests for all new services
- [ ] Integration tests for role permissions
- [ ] E2E tests for company workflow
- [ ] Migration scripts testing
- [ ] Rollback procedure testing

---

## 🚀 Recommended Next Steps

### Immediate (Next Session)

1. Complete `CompanyService.java`
2. Complete `CompanyController.java`
3. Update User model with new roles
4. Create company authentication flow

### Short Term (1-2 days)

1. Build company frontend (dashboard, policy management)
2. Remove admin policy management
3. Test company workflow end-to-end

### Medium Term (3-5 days)

1. Implement Super Admin layer
2. Build approval workflows
3. Create audit logging

### Long Term (1-2 weeks)

1. Restructure document management
2. Implement UI consistency
3. Full system testing
4. Production migration

---

## 💡 Recommendations

Given the scope of this project, I recommend:

1. **Phased Rollout**: Don't try to implement everything at once
2. **Feature Flags**: Use flags to enable/disable new features
3. **Parallel Systems**: Run old and new systems in parallel initially
4. **Extensive Testing**: This touches core functionality - test thoroughly
5. **User Communication**: Inform users of upcoming changes
6. **Rollback Plan**: Have a clear rollback strategy

---

**Status**: Foundation laid, significant work remaining
**Next Priority**: Complete Phase 2 (Company infrastructure)
**Estimated Time to MVP**: 2-3 weeks of focused development
