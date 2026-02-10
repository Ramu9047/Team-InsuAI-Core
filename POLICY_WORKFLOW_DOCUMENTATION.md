# 🔐 Policy Purchase Workflow - Human-in-the-Loop Implementation

## Overview

This implementation provides a complete policy purchase workflow that mirrors real insurance processes with human oversight at critical decision points.

## Workflow Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                    POLICY PURCHASE WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. BROWSING
   └─> User browses available policies
       └─> Clicks "Request Consultation" on desired policy

2. CONSULTATION_REQUESTED
   └─> System creates booking with policy context
       └─> Notifies user: "Consultation request submitted"
       └─> Adds to agent's pending review queue

3. UNDER_REVIEW (Agent Review)
   └─> Agent reviews:
       ├─> User profile (age, income, health, dependents)
       ├─> Policy details (premium, coverage, terms)
       ├─> Risk factors (AI-calculated)
       └─> Eligibility criteria
   
   └─> Agent Decision:
       ├─> APPROVE ──────────────────────────────────┐
       │                                              │
       ├─> REJECT ─────> AI Recommendations ─────────┤
       │                 (Alternative policies)       │
       │                                              │
       └─> REQUEST_MORE_INFO ────────────────────────┘

4a. APPROVED (Standard Cases)
    └─> Policy automatically purchased
        └─> UserPolicy created with status "ACTIVE"
        └─> User notified: "Policy approved and activated!"

4b. PENDING_ADMIN_APPROVAL (High-Risk Cases)
    └─> Flagged for admin review
        └─> Admin reviews agent's decision
        └─> Admin approves/rejects
        └─> If approved: Policy purchased

4c. REJECTED
    └─> User notified with rejection reason
        └─> AI provides 3 alternative policy recommendations
        └─> User can request consultation for alternatives

5. PURCHASED
   └─> Policy active in user's account
       └─> Premium payment scheduled
       └─> Coverage begins
```

---

## API Endpoints

### 1. Request Policy Consultation (User)

**Endpoint:** `POST /api/policy-workflow/request-consultation`

**Request:**
```json
{
  "userId": 123,
  "policyId": 456,
  "reason": "I'm interested in comprehensive health coverage for my family"
}
```

**Response:**
```json
{
  "workflowId": 789,
  "status": "CONSULTATION_REQUESTED",
  "policyName": "Family Health Plus",
  "premium": 15000.00,
  "requestedAt": "2026-02-08T20:00:00"
}
```

---

### 2. Get Pending Reviews (Agent)

**Endpoint:** `GET /api/policy-workflow/agent/{agentId}/pending`

**Response:**
```json
[
  {
    "workflowId": 789,
    "userId": 123,
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "policyId": 456,
    "policyName": "Family Health Plus",
    "premium": 15000.00,
    "status": "PENDING",
    "requestedAt": "2026-02-08T20:00:00",
    "riskLevel": "MEDIUM",
    "eligibilityStatus": "CONDITIONAL"
  }
]
```

---

### 3. Agent Review Decision

**Endpoint:** `POST /api/policy-workflow/agent/{agentId}/review/{bookingId}`

**Request (Approval):**
```json
{
  "decision": "APPROVE",
  "agentNotes": "User meets all eligibility criteria. Good health profile.",
  "requiresAdminApproval": false
}
```

**Request (Rejection with AI Recommendations):**
```json
{
  "decision": "REJECT",
  "rejectionReason": "Premium too high for declared income",
  "agentNotes": "User's income-to-premium ratio is 35%, exceeds safe threshold of 20%",
  "alternativePolicyIds": [101, 102, 103]
}
```

**Response (Rejection):**
```json
{
  "workflowId": 789,
  "status": "REJECTED",
  "rejectionReason": "Premium too high for declared income",
  "aiRecommendations": [
    {
      "policyId": 101,
      "policyName": "Basic Health Cover",
      "premium": 8000.00,
      "coverage": 300000.00,
      "recommendationReason": "More affordable premium with good coverage",
      "matchScore": 0.85
    },
    {
      "policyId": 102,
      "policyName": "Essential Health Plan",
      "premium": 10000.00,
      "coverage": 500000.00,
      "recommendationReason": "Better coverage at affordable rate",
      "matchScore": 0.78
    }
  ]
}
```

---

### 4. Admin Approval (High-Risk Cases)

**Endpoint:** `POST /api/policy-workflow/admin/{adminId}/approve/{bookingId}`

**Request:**
```json
{
  "notes": "Approved after verifying additional documentation"
}
```

---

## Frontend Integration

### User Flow

1. **Policy Browsing Page**
```jsx
<button onClick={() => requestConsultation(policy.id)}>
  Request Consultation
</button>
```

2. **My Consultations Page**
```jsx
// Show workflow status
{workflow.status === 'APPROVED' && (
  <div className="success">
    ✅ Your policy has been approved!
  </div>
)}

{workflow.status === 'REJECTED' && (
  <div className="warning">
    ❌ Application not approved
    <p>Reason: {workflow.rejectionReason}</p>
    
    <h4>Recommended Alternatives:</h4>
    {workflow.aiRecommendations.map(alt => (
      <PolicyCard policy={alt} />
    ))}
  </div>
)}
```

---

### Agent Dashboard

```jsx
// Pending Reviews Tab
<div className="pending-reviews">
  {pendingReviews.map(workflow => (
    <ReviewCard workflow={workflow}>
      <UserProfile user={workflow.user} />
      <PolicyDetails policy={workflow.policy} />
      <RiskAssessment risk={workflow.riskLevel} />
      
      <div className="actions">
        <button onClick={() => approve(workflow.id)}>
          ✅ Approve
        </button>
        <button onClick={() => reject(workflow.id)}>
          ❌ Reject
        </button>
      </div>
    </ReviewCard>
  ))}
</div>
```

---

## AI Recommendation Engine

The system automatically suggests alternative policies when an application is rejected:

**Criteria:**
- **Affordability:** Premium ≤ 20% of monthly income
- **Coverage Match:** Similar or better coverage
- **Risk Profile:** Matches user's health/age profile
- **Type Similarity:** Same category (Health, Life, Auto, etc.)

**Scoring Algorithm:**
```
matchScore = (
  affordabilityScore * 0.4 +
  coverageScore * 0.3 +
  riskProfileScore * 0.2 +
  typeSimilarityScore * 0.1
)
```

---

## Admin Audit Trail

All workflow actions are logged for compliance:

```sql
SELECT 
  w.workflow_id,
  w.user_name,
  w.policy_name,
  w.agent_name,
  w.agent_decision,
  w.admin_reviewer_name,
  w.status,
  w.created_at,
  w.reviewed_at,
  w.admin_reviewed_at
FROM policy_workflows w
WHERE w.requires_admin_approval = true
ORDER BY w.created_at DESC;
```

---

## Benefits

### ✅ For Users
- **Transparent Process:** Clear status updates at each stage
- **Personalized Recommendations:** AI suggests better-fit policies
- **Faster Decisions:** Automated approval for low-risk cases
- **Expert Guidance:** Human agent reviews complex cases

### ✅ For Agents
- **Structured Workflow:** Clear review process
- **Risk Insights:** AI-powered risk assessment
- **Decision Support:** Automated eligibility checks
- **Audit Trail:** All decisions documented

### ✅ For Business
- **Compliance:** Full audit trail for regulatory requirements
- **Risk Management:** Human oversight on high-risk applications
- **Efficiency:** Automated low-risk approvals
- **Customer Satisfaction:** Personalized recommendations

---

## Database Schema Changes

### Booking Table (Updated)
```sql
ALTER TABLE booking ADD COLUMN reviewed_at TIMESTAMP;
ALTER TABLE booking ADD COLUMN rejection_reason VARCHAR(500);
ALTER TABLE booking ADD COLUMN agent_notes TEXT;
ALTER TABLE booking ADD COLUMN admin_notes TEXT;
```

---

## Testing Scenarios

### Scenario 1: Standard Approval
1. User requests consultation for affordable policy
2. Agent reviews → Approves
3. Policy automatically purchased
4. User receives confirmation

### Scenario 2: Rejection with Recommendations
1. User requests expensive policy
2. Agent reviews → Rejects (too expensive)
3. AI suggests 3 cheaper alternatives
4. User requests consultation for alternative

### Scenario 3: High-Risk Admin Approval
1. User requests high-coverage policy
2. Agent approves but flags for admin review
3. Admin reviews additional docs
4. Admin approves → Policy purchased

---

## Next Steps

1. **Frontend Implementation:**
   - Create `PolicyWorkflowPage.js`
   - Add "Request Consultation" buttons to policy cards
   - Build agent review interface
   - Implement admin approval dashboard

2. **Notifications:**
   - Email notifications for status changes
   - SMS alerts for approvals/rejections
   - In-app notification center

3. **Analytics:**
   - Track approval/rejection rates
   - Monitor average review time
   - Measure AI recommendation accuracy

4. **Enhancements:**
   - Document upload for verification
   - Video consultation scheduling
   - Automated underwriting for simple cases

---

## Summary

This implementation provides a **production-ready policy purchase workflow** that:
- ✅ Mirrors real insurance processes
- ✅ Includes human oversight at critical points
- ✅ Provides AI-powered recommendations
- ✅ Maintains full audit trail
- ✅ Scales from manual to automated approval

**Status:** Backend implementation complete ✅  
**Next:** Frontend UI components 🚧
