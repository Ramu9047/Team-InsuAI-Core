# 🎯 QUICK REFERENCE - ALL COMPONENTS

## 📦 Component Import Guide

```javascript
// Notifications
import NotificationCenter from '../components/NotificationCenter';

// Documents
import DocumentManager from '../components/DocumentManager';

// Policy
import PolicyComparison from '../components/PolicyComparison';

// Calendar
import CalendarView from '../components/CalendarView';

// SLA
import SLATimer, { SLADashboard } from '../components/SLATimer';

// Education
import InsuranceLiteracy from '../components/InsuranceLiteracy';

// Search
import SearchFilterExport from '../components/SearchFilterExport';

// Role
import RoleSwitcher, { RoleSwitcherCompact } from '../components/RoleSwitcher';
```

---

## 🚀 Quick Usage Examples

### 1. Notification Center
```javascript
<NotificationCenter userRole="USER" />
```

### 2. Document Manager
```javascript
<DocumentManager userId={123} userRole="USER" />
```

### 3. Policy Comparison
```javascript
<PolicyComparison 
  policies={policyList}
  onSelect={(policy) => console.log(policy)}
/>
```

### 4. Calendar View
```javascript
<CalendarView 
  appointments={appointments}
  userRole="AGENT"
  onSlotClick={(date, time) => bookAppointment(date, time)}
/>
```

### 5. SLA Timer
```javascript
<SLATimer 
  deadline="2026-02-09T20:30:00"
  taskName="Approve Policy"
  priority="HIGH"
  onExpire={() => alert('SLA Breach!')}
/>
```

### 6. Insurance Literacy
```javascript
<InsuranceLiteracy userId={123} />
```

### 7. Search & Export
```javascript
<SearchFilterExport 
  data={dataArray}
  columns={columnConfig}
  onExport={(type, data) => console.log(type, data)}
/>
```

### 8. Role Switcher
```javascript
<RoleSwitcher 
  currentRole="ADMIN"
  onRoleSwitch={(role) => setViewRole(role)}
/>
```

---

## 📊 Component Status

| Component | Status | Lines | Priority |
|-----------|--------|-------|----------|
| NotificationCenter | ✅ | 371 | Critical |
| DocumentManager | ✅ | 450 | Critical |
| PolicyComparison | ✅ | 550 | High |
| CalendarView | ✅ | 600 | High |
| SLATimer | ✅ | 450 | High |
| InsuranceLiteracy | ✅ | 650 | Medium |
| SearchFilterExport | ✅ | 500 | Medium |
| RoleSwitcher | ✅ | 250 | Low |

**Total**: 4,500+ lines | **Status**: 100% Complete

---

## 🎨 Color Palette

```css
/* Primary Colors */
--primary: #4f46e5;      /* Indigo */
--success: #10b981;      /* Green */
--warning: #f59e0b;      /* Amber */
--danger: #ef4444;       /* Red */
--info: #3b82f6;         /* Blue */
--purple: #8b5cf6;       /* Purple */

/* Risk Levels */
--risk-low: #10b981;     /* Green */
--risk-medium: #f59e0b;  /* Amber */
--risk-high: #ef4444;    /* Red */

/* Status Colors */
--status-active: #10b981;
--status-pending: #f59e0b;
--status-expired: #6b7280;
--status-cancelled: #ef4444;
```

---

## 📁 File Structure

```
insurai-frontend/
└── src/
    └── components/
        ├── NotificationCenter.js      ✅
        ├── DocumentManager.js         ✅
        ├── PolicyComparison.js        ✅
        ├── CalendarView.js            ✅
        ├── SLATimer.js                ✅
        ├── InsuranceLiteracy.js       ✅
        ├── SearchFilterExport.js      ✅
        └── RoleSwitcher.js            ✅
```

---

## ✅ Integration Checklist

### User Dashboard
- [ ] Add NotificationCenter to header
- [ ] Add DocumentManager section
- [ ] Add PolicyComparison section
- [ ] Add InsuranceLiteracy section

### Agent Dashboard
- [ ] Add NotificationCenter to header
- [ ] Add CalendarView section
- [ ] Add DocumentManager (for verification)
- [ ] Add SLATimer for tasks

### Admin Dashboard
- [ ] Add NotificationCenter to header
- [ ] Add RoleSwitcher to header
- [ ] Add SearchFilterExport section
- [ ] Add SLADashboard section

---

## 🔧 Props Reference

### NotificationCenter
- `userRole`: "USER" | "AGENT" | "ADMIN"

### DocumentManager
- `userId`: number
- `userRole`: "USER" | "AGENT"

### PolicyComparison
- `policies`: array (optional)
- `onSelect`: function

### CalendarView
- `appointments`: array (optional)
- `userRole`: "USER" | "AGENT"
- `onSlotClick`: function

### SLATimer
- `deadline`: ISO date string
- `taskName`: string
- `priority`: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- `onExpire`: function

### InsuranceLiteracy
- `userId`: number

### SearchFilterExport
- `data`: array
- `columns`: array
- `onExport`: function

### RoleSwitcher
- `currentRole`: "USER" | "AGENT" | "ADMIN"
- `onRoleSwitch`: function

---

## 🎯 Key Features Summary

1. **NotificationCenter**: Real-time alerts, priority coding, deep-linking
2. **DocumentManager**: Upload, verify, reject, download workflow
3. **PolicyComparison**: Side-by-side, AI scoring, best pick
4. **CalendarView**: Week/day views, risk coding, booking
5. **SLATimer**: Countdown, breach detection, admin dashboard
6. **InsuranceLiteracy**: Modules, quiz, tips, scoring
7. **SearchFilterExport**: Multi-filter, sort, CSV/PDF export
8. **RoleSwitcher**: Admin testing, instant switching

---

## 📞 Need Help?

1. Check `ALL_FEATURES_COMPLETE.md` for full documentation
2. Check `ESSENTIAL_ENTERPRISE_FEATURES.md` for feature details
3. Review component files for inline documentation
4. Test with mock data first before API integration

---

**Status**: 🟢 ALL FEATURES COMPLETE  
**Version**: 4.0.0  
**Date**: February 9, 2026
