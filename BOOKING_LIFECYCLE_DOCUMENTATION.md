# 🔄 Booking Lifecycle & Auto-Cleanup Implementation

## Overview

This implementation adds professional appointment lifecycle management with automated cleanup jobs, mirroring real-world insurance workflow systems.

---

## 📊 Booking Status Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  BOOKING STATUS LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────┐
                    │ PENDING │ (Initial state)
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ↓               ↓               ↓
    ┌─────────┐    ┌───────────┐   ┌─────────┐
    │CONFIRMED│    │  EXPIRED  │   │CANCELLED│
    └────┬────┘    └───────────┘   └─────────┘
         │         (Auto after 48h)  (By user)
         │
         ↓
    ┌──────────┐
    │COMPLETED │
    └────┬─────┘
         │
         ├──────────────────┐
         │                  │
         ↓                  ↓
    ┌─────────┐    ┌──────────────────────┐
    │REJECTED │    │PENDING_ADMIN_APPROVAL│
    └─────────┘    └──────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ↓                   ↓
            ┌──────────────┐    ┌─────────┐
            │POLICY_ISSUED │    │REJECTED │
            └──────────────┘    └─────────┘
```

---

## 🎯 Status Definitions

| Status | Description | Terminal? | Auto-Expires? |
|--------|-------------|-----------|---------------|
| **PENDING** | Awaiting agent assignment | ❌ | ✅ After 48h |
| **CONFIRMED** | Agent confirmed, appointment scheduled | ❌ | ✅ After 72h |
| **COMPLETED** | Consultation completed | ❌ | ❌ |
| **POLICY_ISSUED** | Policy approved and issued | ✅ | ❌ |
| **REJECTED** | Application rejected | ✅ | ❌ |
| **EXPIRED** | Auto-expired due to inactivity | ✅ | N/A |
| **CANCELLED** | Cancelled by user | ✅ | ❌ |
| **PENDING_ADMIN_APPROVAL** | Awaiting admin review | ❌ | ❌ |

---

## ⏰ Automated Cleanup Jobs

### 1. **Expire Unattended Bookings** (Runs Every Hour)

**Schedule:** `0 0 * * * *` (Every hour at minute 0)

**Actions:**

- Expires PENDING bookings older than 48 hours
- Expires CONFIRMED bookings with no completion after 72 hours
- Sets `slaBreached = true`
- Sends notifications to users and agents

**SLA Configuration:**

```java
PENDING_EXPIRY_HOURS = 48;      // 2 days
CONFIRMED_EXPIRY_HOURS = 72;    // 3 days
```

**Example Log:**

```
2026-02-08 12:00:00 INFO  - Starting scheduled task: Expire unattended bookings
2026-02-08 12:00:05 DEBUG - Expired PENDING booking ID: 123 (created: 2026-02-06 10:00:00)
2026-02-08 12:00:05 DEBUG - Expired CONFIRMED booking ID: 456 (scheduled: 2026-02-05 14:00:00)
2026-02-08 12:00:10 INFO  - Completed scheduled task: Expired 2 bookings
```

---

### 2. **Auto-Close Completed Bookings** (Runs Daily at 2 AM)

**Schedule:** `0 0 2 * * *` (Every day at 2:00 AM)

**Actions:**

- Identifies COMPLETED bookings older than 7 days
- Marks them as eligible for archival
- Logs archival candidates

**Configuration:**

```java
COMPLETED_AUTO_CLOSE_DAYS = 7;  // 7 days
```

---

### 3. **Weekly Cleanup Report** (Runs Every Monday at Midnight)

**Schedule:** `0 0 0 * * MON` (Every Monday at 00:00)

**Actions:**

- Generates weekly statistics
- Calculates expiry rates
- Logs comprehensive report

**Example Report:**

```
2026-02-10 00:00:00 INFO - Weekly Cleanup Report:
2026-02-10 00:00:00 INFO -   - Pending: 45
2026-02-10 00:00:00 INFO -   - Expired: 8
2026-02-10 00:00:00 INFO -   - Completed: 32
2026-02-10 00:00:00 INFO -   - Policy Issued: 28
2026-02-10 00:00:00 INFO -   - Expiry Rate: 17.78%
```

---

## 🔄 State Transition API

### 1. **Confirm Booking**

```http
POST /api/booking-lifecycle/{bookingId}/confirm
Authorization: Bearer <agent_token>

{
  "agentId": 123,
  "appointmentTime": "2026-02-10T14:00:00"
}
```

**Response:**

```json
{
  "id": 456,
  "status": "CONFIRMED",
  "startTime": "2026-02-10T14:00:00",
  "respondedAt": "2026-02-08T20:30:00"
}
```

---

### 2. **Complete Booking**

```http
POST /api/booking-lifecycle/{bookingId}/complete
Authorization: Bearer <agent_token>

{
  "agentNotes": "User meets all eligibility criteria. Recommended for approval."
}
```

---

### 3. **Cancel Booking** (User)

```http
POST /api/booking-lifecycle/{bookingId}/cancel
Authorization: Bearer <user_token>

{
  "userId": 789
}
```

---

### 4. **Get Booking Timeline**

```http
GET /api/booking-lifecycle/{bookingId}/timeline
Authorization: Bearer <token>
```

**Response:**

```json
{
  "CREATED": "2026-02-08T10:00:00",
  "CONFIRMED": "2026-02-08T11:30:00",
  "COMPLETED": "2026-02-08T15:00:00",
  "POLICY_ISSUED": "2026-02-08T16:00:00"
}
```

---

### 5. **Get Booking Statistics**

```http
GET /api/booking-lifecycle/stats
Authorization: Bearer <agent_token>
```

**Response:**

```json
{
  "PENDING": 12,
  "CONFIRMED": 8,
  "COMPLETED": 5,
  "POLICY_ISSUED": 28,
  "REJECTED": 3,
  "EXPIRED": 7,
  "CANCELLED": 2,
  "PENDING_ADMIN_APPROVAL": 1
}
```

---

### 6. **Get Conversion Funnel**

```http
GET /api/booking-lifecycle/funnel
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "totalRequests": 100,
  "confirmed": 85,
  "completed": 70,
  "policyIssued": 60,
  "rejected": 8,
  "expired": 7,
  "cancelled": 5,
  "confirmationRate": 85.0,
  "completionRate": 70.0,
  "conversionRate": 60.0,
  "rejectionRate": 8.0,
  "expiryRate": 7.0
}
```

---

### 7. **Get Cleanup Statistics**

```http
GET /api/booking-lifecycle/cleanup-stats
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "pendingAtRisk": 3,
  "confirmedAtRisk": 2,
  "totalExpired": 15,
  "totalCompleted": 45,
  "totalPolicyIssued": 38
}
```

---

### 8. **Trigger Manual Cleanup** (Admin)

```http
POST /api/booking-lifecycle/cleanup
Authorization: Bearer <admin_token>
```

---

## 📈 Benefits

### **For Operations:**

- ✅ **Data Hygiene:** Automatic cleanup prevents stale data
- ✅ **SLA Monitoring:** Track response times and breaches
- ✅ **Audit Trail:** Complete timeline for compliance
- ✅ **Metrics:** Conversion funnel and expiry rates

### **For Users:**

- ✅ **Transparency:** Clear status at every stage
- ✅ **Notifications:** Automatic updates on state changes
- ✅ **Timeline:** See complete journey of their request

### **For Agents:**

- ✅ **Priority Queue:** Focus on active bookings
- ✅ **Performance Metrics:** Track completion rates
- ✅ **Workload Management:** Auto-expiry reduces clutter

### **For Admins:**

- ✅ **Dashboard Metrics:** Real-time funnel analytics
- ✅ **Cleanup Reports:** Weekly operational insights
- ✅ **Manual Control:** Trigger cleanup on demand

---

## 🗄️ Database Schema

No schema changes required! Uses existing Booking table fields:

- `status` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `respondedAt` (TIMESTAMP)
- `completedAt` (TIMESTAMP)
- `slaBreached` (BOOLEAN)
- `reviewedAt` (TIMESTAMP)
- `agentNotes` (TEXT)

---

## 🔧 Configuration

### Enable Scheduling

Already enabled in `InsuraiBackendApplication.java`:

```java
@SpringBootApplication
@EnableScheduling
public class InsuraiBackendApplication { ... }
```

### Customize SLA Timings

Edit `BookingCleanupService.java`:

```java
private static final int PENDING_EXPIRY_HOURS = 48;      // Change to 24 for faster expiry
private static final int CONFIRMED_EXPIRY_HOURS = 72;    // Change to 48 for faster expiry
private static final int COMPLETED_AUTO_CLOSE_DAYS = 7;  // Change to 14 for longer retention
```

### Customize Cron Schedules

```java
@Scheduled(cron = "0 0 * * * *")  // Every hour
@Scheduled(cron = "0 0 2 * * *")  // Daily at 2 AM
@Scheduled(cron = "0 0 0 * * MON") // Weekly on Monday
```

---

## 📊 Dashboard Integration

### Funnel Visualization

```jsx
// In AdminDashboard.js
const [funnelMetrics, setFunnelMetrics] = useState(null);

useEffect(() => {
  api.get('/booking-lifecycle/funnel').then(res => {
    setFunnelMetrics(res.data);
  });
}, []);

// Display funnel chart
<div className="funnel-chart">
  <div>Total Requests: {funnelMetrics.totalRequests}</div>
  <div>Confirmed: {funnelMetrics.confirmed} ({funnelMetrics.confirmationRate}%)</div>
  <div>Completed: {funnelMetrics.completed} ({funnelMetrics.completionRate}%)</div>
  <div>Policy Issued: {funnelMetrics.policyIssued} ({funnelMetrics.conversionRate}%)</div>
</div>
```

---

## 🎯 Testing Scenarios

### Scenario 1: Normal Flow

1. User requests consultation → **PENDING**
2. Agent confirms → **CONFIRMED**
3. Consultation happens → **COMPLETED**
4. Agent approves → **POLICY_ISSUED**

### Scenario 2: Auto-Expiry

1. User requests consultation → **PENDING**
2. No agent response for 48 hours
3. Cleanup job runs → **EXPIRED**
4. User notified

### Scenario 3: User Cancellation

1. User requests consultation → **PENDING**
2. User changes mind
3. User cancels → **CANCELLED**
4. Agent notified (if assigned)

---

## 📝 Summary

**Files Created:**

1. ✅ `BookingStatus.java` - Status enum with lifecycle logic
2. ✅ `BookingCleanupService.java` - Automated cleanup jobs
3. ✅ `BookingLifecycleService.java` - State transition management
4. ✅ `BookingLifecycleController.java` - REST API endpoints

**Features:**

- ✅ Complete status lifecycle (8 states)
- ✅ Automated expiry (48h for PENDING, 72h for CONFIRMED)
- ✅ Auto-close completed bookings (7 days)
- ✅ Weekly cleanup reports
- ✅ Timeline tracking
- ✅ Conversion funnel metrics
- ✅ Manual cleanup trigger
- ✅ SLA breach monitoring

**Benefits:**

- ✅ Data hygiene
- ✅ Accurate dashboards
- ✅ Historical audits
- ✅ Professional workflow management

---

**🎉 Your booking system now has enterprise-grade lifecycle management!**
