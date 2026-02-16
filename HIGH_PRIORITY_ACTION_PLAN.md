# 🚀 High-Priority Action Plan - InsurAI Platform

**Target**: Complete remaining critical features  
**Timeline**: 12-17 hours (2-3 days)  
**Priority**: HIGH 🔴

---

## 📋 **TASK BREAKDOWN**

### **Task 1: Create Missing REST Controllers** ⏱️ 2-3 hours

#### **1.1 MeetingController.java**

```java
@RestController
@RequestMapping("/api/meeting")
public class MeetingController {
    
    @PostMapping("/create")
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody MeetingRequest request) {
        // Use GoogleCalendarService
    }
    
    @GetMapping("/{appointmentId}")
    public ResponseEntity<MeetingResponse> getMeeting(@PathVariable Long appointmentId) {
        // Retrieve meeting link from booking
    }
}
```

#### **1.2 CalendarController.java**

```java
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    
    @GetMapping("/add/{appointmentId}")
    public ResponseEntity<byte[]> generateICS(@PathVariable Long appointmentId) {
        // Generate ICS file for download
    }
}
```

#### **1.3 Expose Existing Service Methods**

```java
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @PostMapping("/book")
    public ResponseEntity<Booking> bookAppointment(@RequestBody BookingRequest request) {
        // Call AppointmentWorkflowService.createPolicyAppointment()
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<AppointmentDecisionResponse> approveAppointment(
            @PathVariable Long id, @RequestBody ApprovalRequest request) {
        // Call AppointmentWorkflowService.approveMeeting()
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<AppointmentDecisionResponse> rejectAppointment(
            @PathVariable Long id, @RequestBody RejectionRequest request) {
        // Call AppointmentWorkflowService.rejectAppointment()
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentDecisionResponse> completeAppointment(
            @PathVariable Long id, @RequestBody CompletionRequest request) {
        // Call AppointmentWorkflowService.markAsCompleted()
    }
    
    @GetMapping("/{id}/meeting-link")
    public ResponseEntity<MeetingLinkResponse> getMeetingLink(@PathVariable Long id) {
        // Retrieve meeting link from booking
    }
}
```

**Files to Create**:

- `MeetingController.java`
- `CalendarController.java`
- `AppointmentController.java` (if doesn't exist)

**Estimated Time**: 2-3 hours

---

### **Task 2: Implement Email Service** ⏱️ 4-6 hours

#### **2.1 Create EmailTemplateService.java**

```java
@Service
public class EmailTemplateService {
    
    public String getAppointmentApprovedTemplate(Booking booking) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: #667eea; color: white; padding: 20px; }
                    .content { padding: 20px; }
                    .button { background: #667eea; color: white; padding: 12px 24px; 
                             text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Approved</h1>
                    </div>
                    <div class="content">
                        <p>Hello %s,</p>
                        <p>Your appointment with <strong>%s</strong> has been approved!</p>
                        <p><strong>Date & Time:</strong> %s</p>
                        <p><strong>Meeting Link:</strong> <a href="%s">Join Meeting</a></p>
                        <a href="%s" class="button">View Appointment Details</a>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                booking.getUser().getName(),
                booking.getAgent().getName(),
                booking.getStartTime(),
                booking.getMeetingLink(),
                "https://insurai.com/appointments/" + booking.getId()
            );
    }
    
    public String getAppointmentRejectedTemplate(Booking booking, List<Policy> alternatives) {
        // Similar HTML template for rejection
    }
    
    public String getPolicyApprovedTemplate(UserPolicy userPolicy) {
        // Similar HTML template for policy approval
    }
    
    public String getMeetingReminderTemplate(Booking booking) {
        // 24-hour reminder template
    }
    
    public String getReviewRequestTemplate(Booking booking) {
        // Request user to review agent
    }
}
```

#### **2.2 Create EmailService.java**

```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private EmailTemplateService templateService;
    
    public void sendAppointmentApproved(Booking booking) {
        String htmlContent = templateService.getAppointmentApprovedTemplate(booking);
        sendEmail(
            booking.getUser().getEmail(),
            "Appointment Approved – InsurAI",
            htmlContent
        );
    }
    
    public void sendAppointmentRejected(Booking booking, List<Policy> alternatives) {
        String htmlContent = templateService.getAppointmentRejectedTemplate(booking, alternatives);
        sendEmail(
            booking.getUser().getEmail(),
            "Appointment Update – InsurAI",
            htmlContent
        );
    }
    
    public void sendPolicyApproved(UserPolicy userPolicy) {
        String htmlContent = templateService.getPolicyApprovedTemplate(userPolicy);
        sendEmail(
            userPolicy.getUser().getEmail(),
            "Policy Ready for Activation – InsurAI",
            htmlContent
        );
    }
    
    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("noreply@insurai.com");
            mailSender.send(message);
        } catch (Exception e) {
            // Log error
        }
    }
}
```

#### **2.3 Update application.properties**

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### **2.4 Update AppointmentWorkflowService.java**

```java
@Autowired
private EmailService emailService;

// In approveMeeting() method:
emailService.sendAppointmentApproved(booking);

// In rejectAppointment() method:
emailService.sendAppointmentRejected(booking, alternativePolicies);

// In approvePolicy() method:
emailService.sendPolicyApproved(userPolicy);
```

**Files to Create**:

- `EmailTemplateService.java`
- `EmailService.java`
- Update `application.properties`
- Update `AppointmentWorkflowService.java`

**Dependencies to Add** (pom.xml):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**Estimated Time**: 4-6 hours

---

### **Task 3: Create Missing Frontend Components** ⏱️ 6-8 hours

#### **3.1 ConsultationStatus.jsx** ⏱️ 1.5 hours

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import api from '../services/api';

export default function ConsultationStatus() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="consultation-status">
      <h1>Consultation Status</h1>
      <AppointmentCard
        appointment={appointment}
        showReviewButton={true}
        onReviewSubmitted={() => fetchAppointment()}
      />
    </div>
  );
}
```

#### **3.2 PolicyPayment.jsx** ⏱️ 2 hours

```jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function PolicyPayment() {
  const { userPolicyId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [policy, setPolicy] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await api.post(`/policy/activate/${userPolicyId}`);
      notify('Payment successful! Your policy is now active.', 'success');
      navigate('/my-policies');
    } catch (error) {
      notify('Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="policy-payment">
      <h1>Complete Payment</h1>
      {/* Payment form UI */}
      <button onClick={handlePayment} disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

#### **3.3 MeetingPanel.jsx** ⏱️ 1.5 hours

```jsx
import { useState, useEffect } from 'react';
import { joinMeeting } from '../utils/calendarUtils';
import { useNotification } from '../context/NotificationContext';

export default function MeetingPanel({ appointment }) {
  const { notify } = useNotification();
  const [timeUntilMeeting, setTimeUntilMeeting] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const meetingTime = new Date(appointment.startTime);
      const diff = meetingTime - now;
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilMeeting(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilMeeting('Meeting time has passed');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment.startTime]);

  return (
    <div className="meeting-panel">
      <h3>Upcoming Meeting</h3>
      <p>Time until meeting: {timeUntilMeeting}</p>
      <p>With: {appointment.agent.name}</p>
      <button onClick={() => joinMeeting(appointment.meetingLink, notify)}>
        Join Meeting
      </button>
    </div>
  );
}
```

#### **3.4 PolicyApproval.jsx** ⏱️ 2 hours

```jsx
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function PolicyApproval({ appointment, onApprovalComplete }) {
  const { notify } = useNotification();
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await api.put(`/policy/approve/${appointment.id}`, { notes });
      notify('Policy approved successfully!', 'success');
      onApprovalComplete();
    } catch (error) {
      notify('Failed to approve policy', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await api.put(`/policy/reject/${appointment.id}`, { notes });
      notify('Policy rejected', 'info');
      onApprovalComplete();
    } catch (error) {
      notify('Failed to reject policy', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="policy-approval">
      <h3>Policy Approval Decision</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes..."
      />
      <div className="actions">
        <button onClick={handleApprove} disabled={processing}>
          Approve Policy
        </button>
        <button onClick={handleReject} disabled={processing}>
          Reject Policy
        </button>
      </div>
    </div>
  );
}
```

**Files to Create**:

- `ConsultationStatus.jsx`
- `PolicyPayment.jsx`
- `MeetingPanel.jsx`
- `PolicyApproval.jsx`

**Estimated Time**: 6-8 hours

---

## 📅 **IMPLEMENTATION SCHEDULE**

### **Day 1** (6-8 hours)

- ✅ Morning: Create REST Controllers (3 hours)
- ✅ Afternoon: Start Email Service (3-4 hours)

### **Day 2** (6-8 hours)

- ✅ Morning: Complete Email Service (2-3 hours)
- ✅ Afternoon: Create Frontend Components (4-5 hours)

### **Day 3** (Optional - Testing)

- ✅ Integration testing
- ✅ Bug fixes
- ✅ Documentation updates

---

## ✅ **COMPLETION CHECKLIST**

### **Backend**

- [ ] MeetingController.java created
- [ ] CalendarController.java created
- [ ] AppointmentController.java created/updated
- [ ] EmailTemplateService.java created
- [ ] EmailService.java created
- [ ] Email dependency added to pom.xml
- [ ] application.properties updated
- [ ] AppointmentWorkflowService.java updated with email calls
- [ ] All endpoints tested with Postman

### **Frontend**

- [ ] ConsultationStatus.jsx created
- [ ] PolicyPayment.jsx created
- [ ] MeetingPanel.jsx created
- [ ] PolicyApproval.jsx created
- [ ] Routes added to App.js
- [ ] Navigation links added
- [ ] Components tested in browser

### **Testing**

- [ ] End-to-end appointment workflow tested
- [ ] Email sending tested
- [ ] Calendar integration tested
- [ ] Payment flow tested
- [ ] All user roles tested

---

## 🎯 **SUCCESS CRITERIA**

1. ✅ All REST endpoints accessible and functional
2. ✅ Emails sent successfully for all key events
3. ✅ Frontend components render correctly
4. ✅ Complete user journey works end-to-end
5. ✅ No console errors
6. ✅ Responsive design maintained

---

## 📞 **SUPPORT RESOURCES**

### **Documentation**

- [IMPLEMENTATION_STATUS_REPORT.md](./IMPLEMENTATION_STATUS_REPORT.md)
- [CONSULTATION_FINAL_SUMMARY.md](./CONSULTATION_FINAL_SUMMARY.md)
- [MASTER_DOCUMENTATION_INDEX.md](./MASTER_DOCUMENTATION_INDEX.md)

### **Existing Code References**

- Backend Services: `insurai-backend/src/main/java/com/insurai/service/`
- Existing Controllers: `insurai-backend/src/main/java/com/insurai/controller/`
- Frontend Components: `insurai-frontend/src/components/`
- Utilities: `insurai-frontend/src/utils/calendarUtils.js`

---

**Action Plan Version**: 1.0  
**Created**: February 12, 2026  
**Status**: 🚀 **READY TO EXECUTE**
