# 🎯 Consultation Enhancements - Quick Reference

## 🌟 New Features Overview

### 1. Agent Rating & Review System ⭐

Users can rate agents after consultations with 1-5 stars and optional feedback.

### 2. User Feedback System 💬

Users can submit feedback in 4 categories: Bug, Query, Suggestion, Complaint.

### 3. Meeting Reliability Improvements 🔗

Enhanced meeting link validation and calendar integration.

---

## 📡 API Endpoints

### Agent Reviews

```http
# Submit Review (USER only)
POST /api/reviews/submit
Body: {
  "bookingId": 123,
  "rating": 5,
  "feedback": "Excellent service!"
}

# Get Agent Reviews (PUBLIC)
GET /api/reviews/agent/{agentId}

# Get Review for Booking
GET /api/reviews/booking/{bookingId}

# Check if Can Review (USER only)
GET /api/reviews/can-review/{bookingId}

# Get Agent Statistics (PUBLIC)
GET /api/reviews/agent/{agentId}/stats
Response: {
  "averageRating": 4.7,
  "totalReviews": 25
}
```

### User Feedback

```http
# Submit Feedback (USER only)
POST /api/feedback/submit
Body: {
  "category": "BUG",
  "subject": "Upload issue",
  "description": "Cannot upload documents..."
}

# Get My Feedback (USER only)
GET /api/feedback/my-feedback

# Get All Feedback (ADMIN only)
GET /api/feedback/all

# Filter by Status (ADMIN only)
GET /api/feedback/status/{status}
# status: OPEN, IN_PROGRESS, RESOLVED

# Filter by Category (ADMIN only)
GET /api/feedback/category/{category}
# category: BUG, QUERY, SUGGESTION, COMPLAINT

# Assign Feedback (ADMIN only)
PUT /api/feedback/{feedbackId}/assign/{assigneeId}

# Update Status (ADMIN only)
PUT /api/feedback/{feedbackId}/status
Body: {
  "status": "RESOLVED",
  "adminResponse": "Issue has been fixed..."
}

# Get Statistics (ADMIN only)
GET /api/feedback/stats
Response: {
  "totalFeedback": 50,
  "openFeedback": 10,
  "inProgressFeedback": 15,
  "resolvedFeedback": 25
}
```

---

## 🎨 Frontend Components

### ReviewModal Component

```javascript
import ReviewModal from '../components/ReviewModal';

const [reviewModal, setReviewModal] = useState({ 
  isOpen: false, 
  booking: null 
});

// Open modal
<button onClick={() => setReviewModal({ 
  isOpen: true, 
  booking: appointmentData 
})}>
  ⭐ Rate Agent
</button>

// Modal component
<ReviewModal
  isOpen={reviewModal.isOpen}
  onClose={() => setReviewModal({ isOpen: false, booking: null })}
  booking={reviewModal.booking}
  onReviewSubmitted={(review) => {
    console.log('Review submitted:', review);
    // Refresh data
  }}
/>
```

### StarRating Component

```javascript
import StarRating from '../components/StarRating';

// Display-only mode
<StarRating
  rating={4.5}
  size="medium"
  showCount={true}
  reviewCount={25}
/>

// Interactive mode
<StarRating
  rating={rating}
  onRatingChange={setRating}
  size="large"
  interactive={true}
/>

// Sizes: 'small', 'medium', 'large'
```

### FeedbackForm Component

```javascript
import FeedbackForm from '../components/FeedbackForm';

// Simple usage
<FeedbackForm />

// The component handles everything internally:
// - Category selection
// - Subject input
// - Description textarea
// - Submission
// - Notifications
```

---

## 🗄️ Database Schema

### agent_review Table

```sql
CREATE TABLE agent_review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL UNIQUE,
    agent_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### feedback Table

```sql
CREATE TABLE feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to BIGINT,
    admin_response VARCHAR(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
```

---

## 🔧 Common Tasks

### Task 1: Add Review Button to Appointments

```javascript
// In MyAppointmentsEnhanced.js or AgentRequests.js

import { useState } from 'react';
import ReviewModal from '../components/ReviewModal';

function MyAppointments() {
  const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });

  return (
    <>
      {appointments.map(appointment => (
        <div key={appointment.id}>
          {/* Existing appointment UI */}
          
          {/* Add review button for completed consultations */}
          {appointment.status === 'CONSULTED' && (
            <button 
              onClick={() => setReviewModal({ isOpen: true, booking: appointment })}
              className="secondary-btn"
            >
              ⭐ Rate Agent
            </button>
          )}
        </div>
      ))}

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, booking: null })}
        booking={reviewModal.booking}
        onReviewSubmitted={() => fetchAppointments()}
      />
    </>
  );
}
```

### Task 2: Display Agent Rating on Cards

```javascript
// In AgentCard.js or agent listing components

import StarRating from '../components/StarRating';

function AgentCard({ agent }) {
  return (
    <div className="card">
      <h3>{agent.name}</h3>
      
      {/* Add star rating */}
      <StarRating
        rating={agent.rating || 4.5}
        size="medium"
        showCount={true}
        reviewCount={agent.reviewCount || 0}
      />
      
      {/* Rest of card content */}
    </div>
  );
}
```

### Task 3: Add Feedback Link to Navigation

```javascript
// In Navbar.js or UserDashboard.js

import { Link } from 'react-router-dom';

<Link to="/feedback" className="nav-link">
  💬 Feedback
</Link>

// In App.js routes
<Route path="/feedback" element={<FeedbackPage />} />

// FeedbackPage.js
import FeedbackForm from '../components/FeedbackForm';

export default function FeedbackPage() {
  return (
    <div className="container">
      <FeedbackForm />
    </div>
  );
}
```

### Task 4: Fix Join Meeting Button

```javascript
// In AgentRequests.js or MyAppointmentsEnhanced.js

import { useNotification } from '../context/NotificationContext';

function MyAppointments() {
  const { notify } = useNotification();

  const handleJoinMeeting = (appointment) => {
    const { meetingLink } = appointment;
    
    // Validate meeting link exists
    if (!meetingLink || meetingLink.trim() === '') {
      notify("Meeting link not available yet", "error");
      return;
    }
    
    // Validate URL format
    try {
      new URL(meetingLink);
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
      notify("Opening meeting...", "success");
    } catch (e) {
      notify("Invalid meeting link format", "error");
    }
  };

  return (
    <button onClick={() => handleJoinMeeting(appointment)}>
      🎥 Join Meeting
    </button>
  );
}
```

---

## 🎯 Business Rules

### Agent Reviews

- ✅ One review per booking
- ✅ Only after consultation completed (status: CONSULTED or POLICY_APPROVED)
- ✅ Rating must be 1-5 stars
- ✅ Feedback is optional (max 1000 characters)
- ✅ Agent rating auto-updates after each review

### User Feedback

- ✅ Categories: BUG, QUERY, SUGGESTION, COMPLAINT
- ✅ Subject required (max 255 characters)
- ✅ Description required (max 2000 characters)
- ✅ Status flow: OPEN → IN_PROGRESS → RESOLVED
- ✅ Only admins can assign and update status

---

## 🚨 Error Handling

### Common Errors

```javascript
// Review already submitted
{
  "success": false,
  "error": "Review already submitted for this appointment"
}

// Consultation not completed
{
  "success": false,
  "error": "Can only review completed consultations"
}

// Invalid rating
{
  "success": false,
  "error": "Rating must be between 1 and 5"
}

// Invalid feedback category
{
  "success": false,
  "error": "Invalid category. Must be: BUG, QUERY, SUGGESTION, or COMPLAINT"
}
```

### Frontend Error Handling

```javascript
try {
  const response = await api.post('/reviews/submit', data);
  notify(response.data.message, "success");
} catch (error) {
  // Extract error message
  const errorMsg = error.response?.data?.error || "An error occurred";
  notify(errorMsg, "error");
}
```

---

## 📊 Statistics & Analytics

### Agent Statistics

```javascript
// Fetch agent stats
const response = await api.get(`/reviews/agent/${agentId}/stats`);
const { averageRating, totalReviews } = response.data;

// Display
<div>
  <StarRating rating={averageRating} />
  <span>{totalReviews} reviews</span>
</div>
```

### Feedback Statistics

```javascript
// Fetch feedback stats (admin only)
const response = await api.get('/feedback/stats');
const { totalFeedback, openFeedback, inProgressFeedback, resolvedFeedback } = response.data;

// Display dashboard
<div className="stats-grid">
  <StatCard label="Total" value={totalFeedback} />
  <StatCard label="Open" value={openFeedback} color="orange" />
  <StatCard label="In Progress" value={inProgressFeedback} color="blue" />
  <StatCard label="Resolved" value={resolvedFeedback} color="green" />
</div>
```

---

## ✅ Testing Checklist

### Agent Reviews

```bash
# Test review submission
curl -X POST http://localhost:8080/api/reviews/submit \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": 1, "rating": 5, "feedback": "Great!"}'

# Test getting agent reviews
curl http://localhost:8080/api/reviews/agent/2

# Test agent stats
curl http://localhost:8080/api/reviews/agent/2/stats
```

### User Feedback

```bash
# Test feedback submission
curl -X POST http://localhost:8080/api/feedback/submit \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "BUG", "subject": "Test", "description": "Testing..."}'

# Test getting feedback
curl http://localhost:8080/api/feedback/my-feedback \
  -H "Authorization: Bearer USER_TOKEN"

# Test admin endpoints
curl http://localhost:8080/api/feedback/all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🎉 Quick Wins

### 1. Instant Agent Credibility

Display star ratings on all agent cards to build trust.

### 2. User Voice

Give users a direct channel to share feedback and concerns.

### 3. Quality Improvement

Use reviews and feedback to identify and fix issues quickly.

### 4. Transparency

Public agent ratings create accountability and transparency.

---

**Last Updated**: February 12, 2026  
**Version**: 1.0  
**Status**: Ready for Integration
