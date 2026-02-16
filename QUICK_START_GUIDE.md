# Quick Start Guide - Re-Engineered Platform

## 🚀 For Developers

### 1. Database Setup

```sql
-- Run this first
source database_migration.sql
```

### 2. Create First Super Admin

```sql
-- Manually create a super admin user
INSERT INTO user (name, email, password, role) 
VALUES ('Super Admin', 'superadmin@insurai.com', '$2a$10$...', 'SUPER_ADMIN');
```

### 3. Update Application Configuration

```java
// In User.java, ensure Role enum has:
public enum Role {
    USER, AGENT, ADMIN, COMPANY, SUPER_ADMIN
}
```

### 4. Import Design System

```javascript
// In index.js or App.js
import './styles/design-tokens.css';
import './styles/animations.css';
```

---

## 👔 For Companies

### Registration Flow

1. Visit `/company/register`
2. Fill in company details:
   - Company name
   - Email (will be login username)
   - Password
   - Registration number
   - Contact details
3. Submit application
4. Wait for Super Admin approval
5. Receive notification when approved
6. Login at `/company/login`

### Managing Policies

1. Login to company dashboard
2. Click "Add New Policy"
3. Fill in policy details:
   - Name, type, category
   - Premium and coverage amounts
   - Eligibility criteria
   - Exclusions and warnings
4. Save policy
5. Edit or delete policies anytime

---

## 👨‍💼 For Super Admins

### Approving Companies

1. Login to super admin dashboard
2. View "Pending Approval" tab
3. Review company details
4. Click "Approve" or "Reject"
5. For rejection, provide mandatory reason
6. Company receives notification

### Managing Active Companies

- **Suspend**: Temporarily disable a company
- **Reactivate**: Re-enable a suspended company
- **View Stats**: Monitor system-wide metrics

---

## 👤 For Users

### Submitting Claims (New Flow)

1. Go to "My Claims"
2. Click "Submit New Claim"
3. Select claim type (Health, Accident, etc.)
4. Fill in claim details
5. **Upload required documents** (based on claim type)
6. Submit claim
7. Track claim status

**Note**: Document upload is ONLY available during claim submission

---

## 🎨 For Frontend Developers

### Using StandardCard Component

```javascript
import StandardCard from '../components/StandardCard';

// Basic usage
<StandardCard
  variant="policy"
  title="Health Insurance"
  subtitle="₹5000/month"
  status="ACTIVE"
  icon="🛡️"
  actions={[
    {
      label: 'View Details',
      onClick: () => handleView(),
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: () => handleDelete(),
      variant: 'danger',
      icon: '🗑️'
    }
  ]}
>
  <p>Policy description goes here</p>
</StandardCard>
```

### Available Variants

- `policy` - Blue left border
- `agent` - Purple left border
- `appointment` - Violet left border
- `claim` - Orange left border
- `company` - Green left border
- `default` - No colored border

### Action Button Variants

- `primary` - Blue background
- `secondary` - Transparent with border
- `danger` - Red border/background
- `success` - Green background

---

## 🔐 API Endpoints Reference

### Company Endpoints

```
POST   /api/company/register          - Register new company
GET    /api/company/profile           - Get company profile
PUT    /api/company/profile           - Update profile
GET    /api/company/policies          - Get all policies
POST   /api/company/policies          - Add new policy
PUT    /api/company/policies/:id      - Update policy
DELETE /api/company/policies/:id      - Delete policy
GET    /api/company/active            - Get active companies (public)
```

### Super Admin Endpoints

```
GET    /api/super-admin/companies              - Get all companies
GET    /api/super-admin/companies/pending      - Get pending approvals
POST   /api/super-admin/companies/:id/approve  - Approve company
POST   /api/super-admin/companies/:id/reject   - Reject company (requires reason)
POST   /api/super-admin/companies/:id/suspend  - Suspend company (requires reason)
POST   /api/super-admin/companies/:id/reactivate - Reactivate company
GET    /api/super-admin/stats                  - Get system statistics
```

---

## 🎨 Design Tokens Usage

### Spacing

```css
padding: var(--space-md);    /* 12px */
gap: var(--space-lg);        /* 16px */
margin: var(--space-2xl);    /* 24px */
```

### Typography

```css
font-size: var(--font-size-lg);          /* 18px */
font-weight: var(--font-weight-semibold); /* 600 */
line-height: var(--line-height-normal);   /* 1.5 */
```

### Colors

```css
color: var(--status-approved);     /* Green */
background: var(--status-pending-bg); /* Orange with opacity */
```

### Shadows

```css
box-shadow: var(--shadow-md);  /* Medium shadow */
box-shadow: var(--shadow-xl);  /* Extra large shadow */
```

---

## 🎬 Animation Classes

```html
<!-- Fade in on load -->
<div class="animate-fadeIn">...</div>

<!-- Slide up on load -->
<div class="animate-slideInUp">...</div>

<!-- Hover lift effect -->
<div class="hover-lift">...</div>

<!-- Loading skeleton -->
<div class="loading-skeleton" style="width: 100%; height: 20px;"></div>

<!-- Status indicator -->
<span class="status-indicator active"></span>
```

---

## 🐛 Troubleshooting

### Company can't add policies

- ✅ Check company status is "APPROVED"
- ✅ Check company isActive is true
- ✅ Verify authentication token

### Super admin can't approve companies

- ✅ Verify user role is SUPER_ADMIN
- ✅ Check endpoint permissions in SecurityConfig
- ✅ Ensure database has super admin user

### Cards look inconsistent

- ✅ Import design-tokens.css
- ✅ Import animations.css
- ✅ Use StandardCard component
- ✅ Check CSS variable definitions

### Documents not uploading

- ✅ Verify endpoint is claim-specific
- ✅ Check file size limits
- ✅ Validate file types
- ✅ Ensure claim has claimType set

---

## 📞 Support

For issues or questions:

1. Check `PLATFORM_REENGINEERING_COMPLETE.md` for detailed documentation
2. Review `PLATFORM_REENGINEERING_PLAN.md` for architecture details
3. Consult code comments in source files
4. Contact development team

---

**Last Updated**: February 12, 2026  
**Version**: 2.0 (Re-engineered Platform)
