package com.insurai.config;

import com.insurai.model.*;
import com.insurai.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Configuration
public class MoreDataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final AgentReviewRepository agentReviewRepo;
    private final BookingRepository bookingRepo;
    private final ClaimRepository claimRepo;
    private final CompanyRepository companyRepo;
    private final ExceptionCaseRepository exceptionCaseRepo;
    private final FeedbackRepository feedbackRepo;
    private final PolicyRepository policyRepo;
    private final SmartReminderRepository smartReminderRepo;
    private final UserCompanyMapRepository ucmRepo;
    private final UserPolicyRepository userPolicyRepo;
    private final PasswordEncoder passwordEncoder;

    public MoreDataSeeder(UserRepository userRepo, AgentReviewRepository agentReviewRepo, BookingRepository bookingRepo,
            ClaimRepository claimRepo, CompanyRepository companyRepo,
            ExceptionCaseRepository exceptionCaseRepo, FeedbackRepository feedbackRepo,
            PolicyRepository policyRepo,
            SmartReminderRepository smartReminderRepo, UserCompanyMapRepository ucmRepo,
            UserPolicyRepository userPolicyRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.agentReviewRepo = agentReviewRepo;
        this.bookingRepo = bookingRepo;
        this.claimRepo = claimRepo;
        this.companyRepo = companyRepo;
        this.exceptionCaseRepo = exceptionCaseRepo;
        this.feedbackRepo = feedbackRepo;
        this.policyRepo = policyRepo;
        this.smartReminderRepo = smartReminderRepo;
        this.ucmRepo = ucmRepo;
        this.userPolicyRepo = userPolicyRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepo.count() > 50) {
            System.out.println("MoreDataSeeder: large amount of data already present - skipping.");
            return;
        }

        System.out.println("MoreDataSeeder: Adding additional volume data...");

        List<Company> companies = companyRepo.findAll();
        if (companies.isEmpty())
            return;

        List<Policy> allPolicies = policyRepo.findAll();
        if (allPolicies.isEmpty())
            return;

        Random random = new Random();
        String[] regions = { "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
                "Surat", "Jaipur" };
        String[] firstNames = { "Amit", "Ramesh", "Sita", "Laxmi", "Vikas", "Pramod", "Geeta", "Kiran", "Nikhil",
                "Sneha", "Tarun", "Simran" };
        String[] lastNames = { "Patil", "Deshmukh", "Chauhan", "Nair", "Iyer", "Rao", "Reddy", "Yadav", "Sharma",
                "Varma" };
        String[] healthConditions = { "None", "Diabetes", "Hypertension", "Asthma", "High Cholesterol", "Obesity" };

        // Generate 50 new END-USERS
        List<User> newUsers = new ArrayList<>();
        String pw = passwordEncoder.encode("password123");
        for (int i = 0; i < 50; i++) {
            User u = new User();
            u.setName(
                    firstNames[random.nextInt(firstNames.length)] + " " + lastNames[random.nextInt(lastNames.length)]);
            u.setEmail("user" + i + "_v2@demo.com");
            u.setPassword(pw);
            u.setRole("USER");
            u.setAge(20 + random.nextInt(40));
            u.setAddress(regions[random.nextInt(regions.length)]);
            u.setIncome(40000.0 + random.nextInt(150000));
            u.setDependents(random.nextInt(4));
            u.setHealthInfo(healthConditions[random.nextInt(healthConditions.length)]);
            u.setIsActive(true);
            u.setVerified(true);
            newUsers.add(u);
        }
        userRepo.saveAll(newUsers);

        // Generate 20 new AGENTS
        List<User> newAgents = new ArrayList<>();
        String[] agentSpecs = { "Life", "Health", "Motor", "Travel", "Cyber", "Property" };
        for (int i = 0; i < 20; i++) {
            User a = new User();
            a.setName("Agent " + firstNames[random.nextInt(firstNames.length)] + " "
                    + lastNames[random.nextInt(lastNames.length)]);
            a.setEmail("agent" + i + "_v2@insurai.com");
            a.setPassword(pw);
            a.setRole("AGENT");
            a.setSpecialization(agentSpecs[random.nextInt(agentSpecs.length)]);
            a.setRating(3.5 + (random.nextDouble() * 1.5));
            a.setBio("Experienced agent in " + a.getSpecialization());
            a.setIsActive(true);
            a.setAvailable(true);
            a.setCompany(companies.get(random.nextInt(companies.size())));
            newAgents.add(a);
        }
        userRepo.saveAll(newAgents);

        // For each new user, create randomized associations
        LocalDateTime now = LocalDateTime.now();
        List<Booking> newBookings = new ArrayList<>();
        List<Claim> newClaims = new ArrayList<>();
        List<Feedback> newFeedbacks = new ArrayList<>();
        List<AgentReview> newReviews = new ArrayList<>();
        List<UserPolicy> newUserPolicies = new ArrayList<>();
        List<ExceptionCase> newExceptions = new ArrayList<>();
        List<UserCompanyMap> newUcm = new ArrayList<>();
        List<SmartReminder> newReminders = new ArrayList<>();

        String[] bookingStatuses = { "PENDING", "APPROVED", "COMPLETED", "REJECTED", "CANCELLED" };
        String[] claimStatuses = { "PENDING", "APPROVED", "REJECTED" };
        String[] fbCategories = { "UI Issue", "Agent Feedback", "Policy Confusion", "Payment Error",
                "Feature Request" };

        for (User u : newUsers) {
            Set<Long> addedCompanyIds = new HashSet<>();
            // Assign 1-3 policies
            int numPolicies = 1 + random.nextInt(3);
            for (int pInd = 0; pInd < numPolicies; pInd++) {
                Policy p = allPolicies.get(random.nextInt(allPolicies.size()));
                UserPolicy up = new UserPolicy();
                up.setUser(u);
                up.setPolicy(p);
                up.setStatus(random.nextBoolean() ? "ACTIVE" : "EXPIRED");
                up.setPremium(p.getPremium());
                up.setPurchasedAt(now.minusDays(random.nextInt(500)));
                newUserPolicies.add(up);

                // Add to UCM (ensure no duplicates for the same user + company)
                if (addedCompanyIds.add(p.getCompany().getId())) {
                    UserCompanyMap ucm = new UserCompanyMap();
                    ucm.setUser(u);
                    ucm.setCompany(p.getCompany());
                    ucm.setPolicy(p);
                    newUcm.add(ucm);
                }
            }

            // Create Bookings
            int numBookings = random.nextInt(4);
            for (int bInd = 0; bInd < numBookings; bInd++) {
                User agent = newAgents.get(random.nextInt(newAgents.size()));
                Booking b = new Booking();
                b.setUser(u);
                b.setAgent(agent);
                b.setPolicy(allPolicies.get(random.nextInt(allPolicies.size())));

                String st = bookingStatuses[random.nextInt(bookingStatuses.length)];
                b.setStatus(st);

                LocalDateTime bStart = now.minusDays(random.nextInt(30)).plusHours(random.nextInt(48));
                b.setStartTime(bStart);
                b.setEndTime(bStart.plusHours(1));
                b.setReason("Inquiry and consultation");
                newBookings.add(b);

                // If completed, add an agent review
                if ("COMPLETED".equals(st) && random.nextBoolean()) {
                    AgentReview ar = new AgentReview();
                    ar.setAgent(agent);
                    ar.setUser(u);
                    ar.setBooking(b);
                    ar.setRating(3 + random.nextInt(3)); // 3 to 5
                    ar.setFeedback("Good consultation.");
                    ar.setCreatedAt(bStart.plusDays(1));
                    newReviews.add(ar);
                }
            }

            // Create claims
            if (random.nextDouble() > 0.6) {
                Claim c = new Claim();
                c.setUser(u);
                c.setPolicyName("Random Auto-Assigned Plan");
                c.setClaimType("Health");
                c.setAmount(5000.0 + random.nextInt(95000));
                c.setStatus(claimStatuses[random.nextInt(claimStatuses.length)]);
                c.setDate(now.minusDays(random.nextInt(365)));
                c.setDescription("Claim description for random " + u.getName());
                c.setFraudScore((double) random.nextInt(100));
                newClaims.add(c);

                if ("REJECTED".equals(c.getStatus()) && random.nextDouble() > 0.5) {
                    ExceptionCase ec = new ExceptionCase();
                    ec.setCaseType("DISPUTED_CLAIM");
                    ec.setTitle("Dispute over Claim by " + u.getName());
                    ec.setDescription("User strongly disagrees with rejection.");
                    ec.setPriority("HIGH");
                    ec.setStatus("PENDING");
                    ec.setUser(u);
                    ec.setCreatedAt(now.minusDays(random.nextInt(10)));
                    newExceptions.add(ec);
                }
            }

            // Provide general feedback
            if (random.nextDouble() > 0.8) {
                Feedback fb = new Feedback();
                fb.setUser(u);
                fb.setCategory(fbCategories[random.nextInt(fbCategories.length)]);
                fb.setSubject("General concern regarding platform");
                fb.setDescription("I found some things a bit complicated to use.");
                fb.setStatus(random.nextBoolean() ? "OPEN" : "RESOLVED");
                fb.setCreatedAt(now.minusDays(random.nextInt(60)));
                if ("RESOLVED".equals(fb.getStatus())) {
                    fb.setAdminResponse("We have taken your feedback into consideration, thanks!");
                }
                newFeedbacks.add(fb);
            }

            // Add Smart Reminders
            SmartReminder sr = new SmartReminder();
            sr.setUser(u);
            sr.setTitle("Review Your Policy Details");
            sr.setMessage("You bought a policy but haven't uploaded secondary docs.");
            sr.setType("DOCUMENT_PENDING");
            sr.setPriority("HIGH");
            sr.setReminderTime(now.plusDays(random.nextInt(15)));
            sr.setCreatedAt(now);
            newReminders.add(sr);
        }

        userPolicyRepo.saveAll(newUserPolicies);
        ucmRepo.saveAll(newUcm);

        bookingRepo.saveAll(newBookings);
        agentReviewRepo.saveAll(newReviews);
        claimRepo.saveAll(newClaims);
        exceptionCaseRepo.saveAll(newExceptions);
        feedbackRepo.saveAll(newFeedbacks);
        smartReminderRepo.saveAll(newReminders);

        System.out.println("MoreDataSeeder: Additional data successfully loaded!");
    }
}
