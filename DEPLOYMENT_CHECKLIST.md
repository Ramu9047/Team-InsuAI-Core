# ✅ Platform Re-Engineering - Deployment Checklist

## Pre-Deployment Tasks

### Database Setup

- [ ] Backup existing database
- [ ] Review `database_migration.sql`
- [ ] Run migration script on test database first
- [ ] Verify all tables created successfully
- [ ] Check foreign key constraints
- [ ] Verify indexes created
- [ ] Run verification queries
- [ ] Create legacy company for existing policies
- [ ] Test rollback script (optional)

### Super Admin Setup

- [ ] Generate bcrypt password hash
- [ ] Create super admin user in database
- [ ] Verify super admin can login
- [ ] Test super admin dashboard access
- [ ] Verify super admin permissions

### Backend Configuration

- [ ] Update `User.java` with new roles (COMPANY, SUPER_ADMIN)
- [ ] Update `SecurityConfig.java` with new endpoints
- [ ] Add company endpoints to security config
- [ ] Add super admin endpoints to security config
- [ ] Verify role-based access control
- [ ] Test authentication for all roles
- [ ] Check CORS configuration
- [ ] Review error handling

### Frontend Configuration

- [ ] Import `design-tokens.css` in main CSS/index.js
- [ ] Import `animations.css` in main CSS/index.js
- [ ] Add company dashboard route to `App.js`
- [ ] Add super admin dashboard route to `App.js`
- [ ] Update navigation based on user role
- [ ] Test routing for all new pages
- [ ] Verify CSS variables loading
- [ ] Check responsive design

---

## Testing Checklist

### Unit Tests

- [ ] CompanyService tests
- [ ] CompanyController tests
- [ ] SuperAdminController tests
- [ ] StandardCard component tests
- [ ] Policy ownership validation tests

### Integration Tests

- [ ] Company registration flow
- [ ] Super admin approval workflow
- [ ] Company policy CRUD operations
- [ ] Role-based access control
- [ ] Document upload restrictions

### End-to-End Tests

- [ ] **Company Flow**: Register → Wait for approval → Login → Add policy
- [ ] **Super Admin Flow**: Login → View pending → Approve company
- [ ] **Rejection Flow**: Super admin rejects → Company notified
- [ ] **Suspension Flow**: Super admin suspends → Company disabled
- [ ] **Policy Management**: Company adds/edits/deletes own policies
- [ ] **User Flow**: Browse policies → See company info → Purchase

### UI/UX Tests

- [ ] All cards use StandardCard component
- [ ] Cards have uniform sizing
- [ ] Consistent spacing throughout
- [ ] Animations work smoothly
- [ ] Status badges display correctly
- [ ] Action buttons aligned properly
- [ ] Mobile responsive design
- [ ] Dark mode compatibility (if applicable)

### Security Tests

- [ ] Company can only manage own policies
- [ ] Admin cannot create/edit policies
- [ ] Super admin permissions enforced
- [ ] CORS properly configured
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

---

## Manual Updates Required

### High Priority

- [ ] Remove policy CRUD from `AdminController.java`
- [ ] Remove policy management UI from `AdminDashboard.js`
- [ ] Add read-only policy viewing for admin
- [ ] Remove document management from `UserDashboard.js`
- [ ] Add document upload to claim submission forms
- [ ] Create company login page
- [ ] Create company registration page

### Medium Priority

- [ ] Migrate existing cards to use `StandardCard`
  - [ ] `Plans.js`
  - [ ] `PlansEnhanced.js`
  - [ ] `MyPolicies.js`
  - [ ] `AgentRequests.js`
  - [ ] `MyClaims.js`
- [ ] Update policy cards to show company info
- [ ] Add company logo display
- [ ] Update navigation menu for new roles

### Low Priority

- [ ] Create audit log viewer
- [ ] Add compliance monitoring dashboard
- [ ] Create company analytics page
- [ ] Add policy performance metrics
- [ ] Implement advanced search/filtering

---

## Deployment Steps

### Staging Environment

- [ ] Deploy backend to staging
- [ ] Deploy frontend to staging
- [ ] Run smoke tests
- [ ] Test all user flows
- [ ] Check error logs
- [ ] Verify database connections
- [ ] Test performance
- [ ] Get stakeholder approval

### Production Deployment

- [ ] Schedule maintenance window
- [ ] Notify users of downtime
- [ ] Backup production database
- [ ] Run database migration
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working

### Post-Deployment

- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Track user registrations
- [ ] Monitor company approvals
- [ ] Check for errors/exceptions
- [ ] Collect user feedback
- [ ] Create incident response plan

---

## Documentation Review

- [ ] Read `README_REENGINEERING.md`
- [ ] Review `PLATFORM_REENGINEERING_COMPLETE.md`
- [ ] Study `QUICK_START_GUIDE.md`
- [ ] Understand `database_migration.sql`
- [ ] Review `VISUAL_SUMMARY.md`
- [ ] Check API endpoint documentation
- [ ] Review role hierarchy
- [ ] Understand workflow changes

---

## Training & Communication

### Internal Team

- [ ] Train developers on new architecture
- [ ] Explain role hierarchy changes
- [ ] Demo StandardCard component usage
- [ ] Show design system tokens
- [ ] Explain company workflow
- [ ] Demo super admin dashboard
- [ ] Review security changes

### Stakeholders

- [ ] Present new company model
- [ ] Explain super admin governance
- [ ] Show UI consistency improvements
- [ ] Demonstrate workflows
- [ ] Discuss benefits
- [ ] Address concerns
- [ ] Get sign-off

### End Users

- [ ] Create user guide for companies
- [ ] Document registration process
- [ ] Explain policy management
- [ ] Update help documentation
- [ ] Create video tutorials (optional)
- [ ] Prepare FAQ
- [ ] Set up support channels

---

## Rollback Plan

### If Issues Arise

- [ ] Have rollback script ready
- [ ] Backup current state
- [ ] Document issues encountered
- [ ] Notify stakeholders
- [ ] Execute rollback if needed
- [ ] Restore database backup
- [ ] Redeploy previous version
- [ ] Investigate root cause
- [ ] Plan fixes
- [ ] Schedule re-deployment

---

## Success Metrics

### Technical Metrics

- [ ] Zero critical errors in first 24 hours
- [ ] API response time < 200ms
- [ ] Database query time < 50ms
- [ ] Page load time < 2 seconds
- [ ] 99.9% uptime

### Business Metrics

- [ ] Company registration rate
- [ ] Approval turnaround time
- [ ] Policy creation rate
- [ ] User satisfaction score
- [ ] Support ticket volume

### Quality Metrics

- [ ] Code coverage > 80%
- [ ] Zero security vulnerabilities
- [ ] Accessibility score > 90
- [ ] Performance score > 90
- [ ] SEO score > 90

---

## Sign-Off

### Development Team

- [ ] Backend Lead: _________________ Date: _______
- [ ] Frontend Lead: ________________ Date: _______
- [ ] QA Lead: _____________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______

### Management

- [ ] Product Manager: ______________ Date: _______
- [ ] Technical Lead: _______________ Date: _______
- [ ] Project Manager: ______________ Date: _______

### Stakeholders

- [ ] Business Owner: _______________ Date: _______
- [ ] Compliance Officer: ___________ Date: _______

---

## Notes & Issues

### Known Issues

```
1. [Issue description]
   Status: [Open/In Progress/Resolved]
   Priority: [High/Medium/Low]
   Assigned to: [Name]

2. [Issue description]
   Status: [Open/In Progress/Resolved]
   Priority: [High/Medium/Low]
   Assigned to: [Name]
```

### Observations

```
[Add any observations during deployment]
```

### Lessons Learned

```
[Document lessons learned for future reference]
```

---

**Checklist Version**: 1.0  
**Last Updated**: February 12, 2026  
**Status**: Ready for Use  

---

## Quick Status Check

```
Pre-Deployment:     [ ] Complete  [ ] In Progress  [ ] Not Started
Testing:            [ ] Complete  [ ] In Progress  [ ] Not Started
Manual Updates:     [ ] Complete  [ ] In Progress  [ ] Not Started
Staging Deploy:     [ ] Complete  [ ] In Progress  [ ] Not Started
Production Deploy:  [ ] Complete  [ ] In Progress  [ ] Not Started
Post-Deployment:    [ ] Complete  [ ] In Progress  [ ] Not Started

Overall Status:     [ ] Ready  [ ] Not Ready
```

---

**Use this checklist to track your deployment progress!** ✅
