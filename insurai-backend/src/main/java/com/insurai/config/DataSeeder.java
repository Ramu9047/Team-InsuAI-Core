package com.insurai.config;

import com.insurai.model.*;
import com.insurai.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DataSeeder – Realistic, fully-interlinked end-to-end test data.
 * Guard: only runs on a completely clean DB (users count == 0).
 */
@Component
public class DataSeeder implements CommandLineRunner {

        private final PolicyRepository policyRepo;
        private final UserRepository userRepo;
        private final CompanyRepository companyRepo;
        private final BookingRepository bookingRepo;
        private final UserPolicyRepository userPolicyRepo;
        private final ClaimRepository claimRepo;
        private final FeedbackRepository feedbackRepo;
        private final AuditLogRepository auditLogRepo;
        private final UserCompanyMapRepository userCompanyMapRepo;
        private final PasswordEncoder passwordEncoder;

        public DataSeeder(
                        PolicyRepository policyRepo,
                        UserRepository userRepo,
                        CompanyRepository companyRepo,
                        BookingRepository bookingRepo,
                        UserPolicyRepository userPolicyRepo,
                        ClaimRepository claimRepo,
                        FeedbackRepository feedbackRepo,
                        AuditLogRepository auditLogRepo,
                        UserCompanyMapRepository userCompanyMapRepo,
                        PasswordEncoder passwordEncoder) {
                this.policyRepo = policyRepo;
                this.userRepo = userRepo;
                this.companyRepo = companyRepo;
                this.bookingRepo = bookingRepo;
                this.userPolicyRepo = userPolicyRepo;
                this.claimRepo = claimRepo;
                this.feedbackRepo = feedbackRepo;
                this.auditLogRepo = auditLogRepo;
                this.userCompanyMapRepo = userCompanyMapRepo;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        @Transactional
        @SuppressWarnings({ "null", "unused" })
        public void run(String... args) throws Exception {
                if (userRepo.count() > 0) {
                        System.out.println("DataSeeder: data already present - skipping.");
                        return;
                }
                System.out.println("DataSeeder: clean DB detected - seeding all data...");

                // == 1. Companies ====================================================
                Company securLife = saveCompany("SecureLife", "securelife@insurai.com", "REG-SL-001",
                                "SecureLife Insurance Ltd.", "Mumbai");
                Company healthPlus = saveCompany("HealthPlus", "healthplus@insurai.com", "REG-HP-002",
                                "HealthPlus Medical Insurance", "Bengaluru");
                Company futureGuard = saveCompany("FutureGuard", "futureguard@insurai.com", "REG-FG-003",
                                "FutureGuard General Insurance", "Delhi");
                System.out.println("Companies seeded (3)");

                // == 2. Policies =====================================================
                Policy slP1 = policyRepo.save(makePolicy("SecureLife Term Plan", "Personal Insurance", "Life", 500.0,
                                10000000.0, securLife));
                Policy slP2 = policyRepo.save(makePolicy("SecureLife Wealth Builder", "Investment Plans", "Investment",
                                2000.0, 1000000.0, securLife));
                Policy slP3 = policyRepo.save(
                                makePolicy("SecureLife Car Cover", "Other Plans", "Car", 800.0, 500000.0, securLife));
                Policy slP4 = policyRepo.save(makePolicy("SecureLife Home Shield", "Other Plans", "Home", 400.0,
                                2000000.0, securLife));
                Policy slP5 = policyRepo.save(makePolicy("SecureLife Group Health", "Employee Benefits", "Group Health",
                                8000.0, 300000.0, securLife));
                Policy slP6 = policyRepo.save(makePolicy("SecureLife Critical Care", "Health Insurance", "Critical",
                                1200.0, 5000000.0, securLife));

                Policy hpP1 = policyRepo.save(makePolicy("HealthPlus Standard", "Health Insurance", "Health", 1200.0,
                                500000.0, healthPlus));
                Policy hpP2 = policyRepo.save(makePolicy("HealthPlus Family Floater", "Health Insurance", "Health",
                                2500.0, 1000000.0, healthPlus));
                Policy hpP3 = policyRepo.save(makePolicy("HealthPlus OPD Cover", "Health Insurance", "Health", 400.0,
                                50000.0, healthPlus));
                Policy hpP4 = policyRepo.save(makePolicy("HealthPlus 1Cr Cover", "Health Insurance", "Health", 3500.0,
                                10000000.0, healthPlus));
                Policy hpP5 = policyRepo.save(makePolicy("HealthPlus Cancer Shield", "Health Insurance", "Critical",
                                900.0, 2500000.0, healthPlus));
                Policy hpP6 = policyRepo.save(makePolicy("HealthPlus Senior Care", "Health Insurance", "Senior", 1800.0,
                                800000.0, healthPlus));

                Policy fgP1 = policyRepo.save(makePolicy("FutureGuard Term Life", "Personal Insurance", "Life", 600.0,
                                8000000.0, futureGuard));
                Policy fgP2 = policyRepo.save(makePolicy("FutureGuard Motor Plus", "Other Plans", "Car", 1000.0,
                                700000.0, futureGuard));
                Policy fgP3 = policyRepo.save(makePolicy("FutureGuard Travel Pak", "Other Plans", "Travel", 300.0,
                                500000.0, futureGuard));
                Policy fgP4 = policyRepo.save(makePolicy("FutureGuard Business Risk", "Business Insurance", "Property",
                                2000.0, 5000000.0, futureGuard));
                Policy fgP5 = policyRepo.save(makePolicy("FutureGuard Cyber Guard", "Liability", "Cyber", 3000.0,
                                10000000.0, futureGuard));
                Policy fgP6 = policyRepo.save(makePolicy("FutureGuard Pension Plan", "Investment Plans", "Pension",
                                5000.0, 20000000.0, futureGuard));
                System.out.println("Policies seeded (18)");

                // == 3a. Super-Admin ==========================================
                User superAdmin1 = userRepo.save(makeUser("Super Admin", "superadmin@insurai.com", "super123",
                                "SUPER_ADMIN", 35, "Mumbai", null, null, null));

                // == 3b. Company Admins (one per company) =====================
                User caSecureLife = userRepo.save(makeUser("Rajan Mehta", "admin.securelife@insurai.com", "password123",
                                "COMPANY_ADMIN", 40, "Mumbai", null, null, null));
                caSecureLife.setCompany(securLife);
                caSecureLife = userRepo.save(caSecureLife);

                User caHealthPlus = userRepo.save(makeUser("Sundar Iyer", "admin.healthplus@insurai.com", "password123",
                                "COMPANY_ADMIN", 38, "Bengaluru", null, null, null));
                caHealthPlus.setCompany(healthPlus);
                caHealthPlus = userRepo.save(caHealthPlus);

                User caFutureGuard = userRepo
                                .save(makeUser("Pooja Verma", "admin.futureguard@insurai.com", "password123",
                                                "COMPANY_ADMIN", 36, "Delhi", null, null, null));
                caFutureGuard.setCompany(futureGuard);
                caFutureGuard = userRepo.save(caFutureGuard);

                // == 3b. Agents =======================================================
                User ag1 = userRepo.save(makeAgent("Rahul Sharma", "agent.rahul@insurai.com", securLife,
                                "Life & Health", 4.9, "Senior certified agent - 8 yrs experience."));
                User ag2 = userRepo.save(makeAgent("Meena Iyer", "agent.meena@insurai.com", securLife,
                                "Investment Plans", 4.7, "Top investment advisor for SecureLife."));
                User ag3 = userRepo.save(makeAgent("Karthik Bose", "agent.karthik@insurai.com", securLife,
                                "Motor & Car", 4.6, "Specialised in motor and vehicle insurance."));
                User ag4 = userRepo.save(makeAgent("Divya Nair", "agent.divya@insurai.com", healthPlus, "Health", 4.8,
                                "HealthPlus certified health insurance expert."));
                User ag5 = userRepo.save(makeAgent("Suresh Menon", "agent.suresh@insurai.com", healthPlus,
                                "Critical Care", 4.5, "Oncology and critical illness specialist."));
                User ag6 = userRepo.save(makeAgent("Priya Pillai", "agent.priya@insurai.com", healthPlus,
                                "Family Floater", 4.7, "Family health plan consultant."));
                User ag7 = userRepo.save(makeAgent("Vikram Reddy", "agent.vikram@insurai.com", futureGuard,
                                "Life & Pension", 4.8, "Retirement planning and life insurance expert."));
                User ag8 = userRepo.save(makeAgent("Ananya Ghosh", "agent.ananya@insurai.com", futureGuard,
                                "Business & Cyber", 4.6, "Corporate risk and cyber liability specialist."));
                User ag9 = userRepo.save(makeAgent("Rohan Verma", "agent.rohan@insurai.com", futureGuard,
                                "Travel & Motor", 4.4, "Travel and comprehensive motor insurance."));
                User ag10 = userRepo.save(makeAgent("Lakshmi Das", "agent.lakshmi@insurai.com", futureGuard, "General",
                                4.5, "General insurance for all categories."));
                System.out.println("Agents seeded (10)");

                // == 3c. End-Users ====================================================
                String pw = "password123";
                User u1 = userRepo.save(makeUser("Arjun Kapoor", "arjun@demo.com", pw, "USER", 32, "Mumbai", 95000.0, 2,
                                "None"));
                User u2 = userRepo.save(makeUser("Priyanka Singh", "priyanka@demo.com", pw, "USER", 28, "Delhi",
                                75000.0, 1, "Mild Hypertension"));
                User u3 = userRepo.save(makeUser("Suresh Kumar", "suresh@demo.com", pw, "USER", 45, "Chennai", 120000.0,
                                3, "Diabetes Type-2"));
                User u4 = userRepo.save(makeUser("Kavya Rajan", "kavya@demo.com", pw, "USER", 25, "Bengaluru", 55000.0,
                                0, "None"));
                User u5 = userRepo.save(makeUser("Deepak Patel", "deepak@demo.com", pw, "USER", 38, "Ahmedabad",
                                85000.0, 2, "Asthma"));
                User u6 = userRepo.save(makeUser("Neha Sharma", "neha@demo.com", pw, "USER", 30, "Hyderabad", 70000.0,
                                1, "None"));
                User u7 = userRepo.save(makeUser("Aditya Raj", "aditya@demo.com", pw, "USER", 34, "Kolkata", 100000.0,
                                2, "None"));
                User u8 = userRepo.save(makeUser("Meera Pillai", "meera@demo.com", pw, "USER", 27, "Kochi", 62000.0, 0,
                                "None"));
                User u9 = userRepo.save(makeUser("Rohit Gupta", "rohit@demo.com", pw, "USER", 41, "Pune", 115000.0, 3,
                                "High Cholesterol"));
                User u10 = userRepo.save(makeUser("Anjali Desai", "anjali@demo.com", pw, "USER", 29, "Surat", 58000.0,
                                1, "None"));
                User u11 = userRepo.save(makeUser("Manish Tiwari", "manish@demo.com", pw, "USER", 37, "Nagpur", 90000.0,
                                2, "None"));
                User u12 = userRepo.save(makeUser("Sunita Rao", "sunita@demo.com", pw, "USER", 33, "Visakhapatnam",
                                80000.0, 1, "None"));
                User u13 = userRepo.save(makeUser("Prakash Nair", "prakash@demo.com", pw, "USER", 48,
                                "Thiruvananthapuram", 130000.0, 4, "Diabetes"));
                User u14 = userRepo.save(makeUser("Pooja Mehta", "pooja@demo.com", pw, "USER", 26, "Jaipur", 52000.0, 0,
                                "None"));
                User u15 = userRepo.save(makeUser("Ravi Shankar", "ravi@demo.com", pw, "USER", 43, "Lucknow", 110000.0,
                                3, "None"));
                System.out.println("End-users seeded (15)");

                // == 4. Bookings ======================================================
                LocalDateTime now = LocalDateTime.now();

                // PENDING
                bookingRepo.save(makeBooking(u1, ag1, slP1, "PENDING", now.plusDays(3), now.plusDays(3).plusHours(1)));
                bookingRepo.save(makeBooking(u2, ag4, hpP1, "PENDING", now.plusDays(4), now.plusDays(4).plusHours(1)));
                bookingRepo.save(makeBooking(u4, ag4, hpP2, "PENDING", now.plusDays(5), now.plusDays(5).plusHours(1)));
                bookingRepo.save(makeBooking(u8, ag7, fgP1, "PENDING", now.plusDays(6), now.plusDays(6).plusHours(1)));
                bookingRepo.save(makeBooking(u14, ag9, fgP3, "PENDING", now.plusDays(7), now.plusDays(7).plusHours(1)));

                // APPROVED
                bookingRepo.save(makeBooking(u3, ag1, slP1, "APPROVED", now.plusDays(1), now.plusDays(1).plusHours(1)));
                bookingRepo.save(makeBooking(u5, ag4, hpP1, "APPROVED", now.plusDays(2), now.plusDays(2).plusHours(1)));
                bookingRepo.save(makeBooking(u6, ag7, fgP1, "APPROVED", now.plusDays(2).plusHours(3),
                                now.plusDays(2).plusHours(4)));
                bookingRepo.save(makeBooking(u9, ag2, slP2, "APPROVED", now.plusDays(3), now.plusDays(3).plusHours(1)));
                bookingRepo.save(
                                makeBooking(u10, ag5, hpP5, "APPROVED", now.plusDays(4), now.plusDays(4).plusHours(1)));

                // COMPLETED – save individually so IDs are returned for audit logs
                Booking bC1 = bookingRepo.save(makeBooking(u1, ag1, slP1, "COMPLETED", now.minusDays(10),
                                now.minusDays(10).plusHours(1)));
                Booking bC2 = bookingRepo.save(makeBooking(u2, ag4, hpP1, "COMPLETED", now.minusDays(8),
                                now.minusDays(8).plusHours(1)));
                bookingRepo.save(makeBooking(u3, ag2, slP2, "COMPLETED", now.minusDays(7),
                                now.minusDays(7).plusHours(1)));
                bookingRepo.save(makeBooking(u5, ag4, hpP2, "COMPLETED", now.minusDays(12),
                                now.minusDays(12).plusHours(1)));
                bookingRepo.save(makeBooking(u6, ag7, fgP1, "COMPLETED", now.minusDays(5),
                                now.minusDays(5).plusHours(1)));
                bookingRepo.save(makeBooking(u7, ag3, slP3, "COMPLETED", now.minusDays(14),
                                now.minusDays(14).plusHours(1)));
                bookingRepo.save(makeBooking(u9, ag8, fgP5, "COMPLETED", now.minusDays(9),
                                now.minusDays(9).plusHours(1)));
                bookingRepo.save(makeBooking(u11, ag5, hpP5, "COMPLETED", now.minusDays(6),
                                now.minusDays(6).plusHours(1)));
                bookingRepo.save(makeBooking(u12, ag6, hpP3, "COMPLETED", now.minusDays(11),
                                now.minusDays(11).plusHours(1)));
                bookingRepo.save(makeBooking(u13, ag7, fgP6, "COMPLETED", now.minusDays(15),
                                now.minusDays(15).plusHours(1)));
                bookingRepo.save(makeBooking(u15, ag10, fgP2, "COMPLETED", now.minusDays(3),
                                now.minusDays(3).plusHours(1)));

                // REJECTED
                Booking bR1 = bookingRepo.save(makeBooking(u3, ag5, hpP6, "REJECTED", now.minusDays(20),
                                now.minusDays(20).plusHours(1)));
                bookingRepo.save(makeBooking(u13, ag2, slP6, "REJECTED", now.minusDays(18),
                                now.minusDays(18).plusHours(1)));
                bookingRepo.save(makeBooking(u9, ag3, slP3, "REJECTED", now.minusDays(13),
                                now.minusDays(13).plusHours(1)));

                // CANCELLED
                bookingRepo.save(makeBooking(u4, ag9, fgP3, "CANCELLED", now.minusDays(2),
                                now.minusDays(2).plusHours(1)));
                System.out.println("Bookings seeded (25)");

                // == 5. UserPolicies + UCM ===========================================
                userPolicyRepo.save(makeUserPolicy(u1, slP1, "ACTIVE", slP1.getPremium(), now.minusDays(9)));
                userPolicyRepo.save(makeUserPolicy(u2, hpP1, "ACTIVE", hpP1.getPremium(), now.minusDays(7)));
                userPolicyRepo.save(makeUserPolicy(u3, slP2, "ACTIVE", slP2.getPremium(), now.minusDays(6)));
                userPolicyRepo.save(makeUserPolicy(u5, hpP2, "ACTIVE", hpP2.getPremium(), now.minusDays(11)));
                userPolicyRepo.save(makeUserPolicy(u6, fgP1, "ACTIVE", fgP1.getPremium(), now.minusDays(4)));
                userPolicyRepo.save(makeUserPolicy(u7, slP3, "ACTIVE", slP3.getPremium(), now.minusDays(13)));
                userPolicyRepo.save(makeUserPolicy(u9, fgP5, "ACTIVE", fgP5.getPremium(), now.minusDays(8)));
                userPolicyRepo.save(makeUserPolicy(u11, hpP5, "ACTIVE", hpP5.getPremium(), now.minusDays(5)));
                userPolicyRepo.save(makeUserPolicy(u12, hpP3, "ACTIVE", hpP3.getPremium(), now.minusDays(10)));
                userPolicyRepo.save(makeUserPolicy(u13, fgP6, "ACTIVE", fgP6.getPremium(), now.minusDays(14)));
                userPolicyRepo.save(makeUserPolicy(u15, fgP2, "ACTIVE", fgP2.getPremium(), now.minusDays(2)));
                userPolicyRepo.save(makeUserPolicy(u1, hpP5, "PENDING_APPROVAL", hpP5.getPremium(), now.minusDays(1)));
                userPolicyRepo.save(makeUserPolicy(u3, fgP4, "INACTIVE", fgP4.getPremium(), now.minusDays(30)));

                // Cross-company user: u1 also buys from HealthPlus (many-to-many)
                userPolicyRepo.save(makeUserPolicy(u1, hpP2, "ACTIVE", hpP2.getPremium(), now.minusDays(3)));
                saveUCM(u1, healthPlus, hpP2);

                saveUCM(u1, securLife, slP1);
                saveUCM(u2, healthPlus, hpP1);
                saveUCM(u3, securLife, slP2);
                saveUCM(u5, healthPlus, hpP2);
                saveUCM(u6, futureGuard, fgP1);
                saveUCM(u7, securLife, slP3);
                saveUCM(u9, futureGuard, fgP5);
                saveUCM(u11, healthPlus, hpP5);
                saveUCM(u12, healthPlus, hpP3);
                saveUCM(u13, futureGuard, fgP6);
                saveUCM(u15, futureGuard, fgP2);
                System.out.println("UserPolicies + UCM seeded (u1 belongs to 2 companies)");

                // == 6. Claims ========================================================
                Claim cl1 = claimRepo.save(
                                makeClaim(u1, slP1, "HEALTH", 35000.0, "APPROVED", 0.04, now.minusDays(5)));
                Claim cl2 = claimRepo.save(makeClaim(u2, hpP1, "HEALTH", 18000.0, "UNDER_REVIEW", 0.12,
                                now.minusDays(3)));
                Claim cl3 = claimRepo.save(makeClaim(u3, slP2, "ACCIDENT", 22000.0, "DOCS_UPLOADED", 0.07,
                                now.minusDays(6)));
                Claim cl4 = claimRepo.save(
                                makeClaim(u5, hpP2, "HEALTH", 45000.0, "APPROVED", 0.05, now.minusDays(15)));
                Claim cl5 = claimRepo.save(
                                makeClaim(u6, fgP1, "DEATH", 200000.0, "INITIATED", 0.62, now.minusDays(1)));
                Claim cl6 = claimRepo.save(makeClaim(u7, slP3, "PROPERTY_DAMAGE", 12000.0, "APPROVED", 0.09,
                                now.minusDays(20)));
                Claim cl7 = claimRepo.save(makeClaim(u9, fgP5, "CYBER", 55000.0, "UNDER_REVIEW", 0.35,
                                now.minusDays(4)));
                Claim cl8 = claimRepo.save(makeClaim(u11, hpP5, "HEALTH", 300000.0, "APPROVED", 0.03,
                                now.minusDays(25)));
                Claim cl9 = claimRepo.save(
                                makeClaim(u12, hpP3, "HEALTH", 8500.0, "REJECTED", 0.71, now.minusDays(8)));
                Claim cl10 = claimRepo.save(makeClaim(u13, fgP6, "ACCIDENT", 90000.0, "DOCS_UPLOADED", 0.15,
                                now.minusDays(2)));
                Claim cl11 = claimRepo.save(makeClaim(u15, fgP2, "PROPERTY_DAMAGE", 28000.0, "APPROVED", 0.06,
                                now.minusDays(10)));
                System.out.println("Claims seeded (11)");

                // == 7. Feedback ======================================================
                Feedback fb1 = feedbackRepo.save(makeFeedback(u1, superAdmin1, "BUG", "Login loop on mobile",
                                "App keeps logging out.", "RESOLVED", "Fixed in v2.3.", now.minusDays(10)));
                Feedback fb2 = feedbackRepo.save(makeFeedback(u2, null, "QUERY", "Policy cancellation process",
                                "How do I cancel my policy?", "OPEN", null, now.minusDays(2)));
                feedbackRepo.save(makeFeedback(u3, superAdmin1, "SUGGESTION", "Dark mode for app",
                                "Please add dark mode.",
                                "RESOLVED", "Coming in next release.", now.minusDays(15)));
                feedbackRepo.save(makeFeedback(u4, null, "COMPLAINT", "Agent response delayed",
                                "My agent took 3 days to reply.", "OPEN", null, now.minusDays(1)));
                Feedback fb5 = feedbackRepo.save(makeFeedback(u5, superAdmin1, "COMPLAINT", "Claim rejected unfairly",
                                "My health claim was rejected.", "IN_PROGRESS", "Under review with claims team.",
                                now.minusDays(5)));
                feedbackRepo.save(makeFeedback(u6, null, "QUERY", "Premium payment failed",
                                "My UPI payment failed twice.", "OPEN", null, now.minusDays(3)));
                feedbackRepo.save(makeFeedback(u7, superAdmin1, "SUGGESTION", "More payment options",
                                "Add credit card EMI option.", "RESOLVED", "EMI option added.", now.minusDays(20)));
                feedbackRepo.save(makeFeedback(u8, null, "BUG", "PDF download broken", "Policy PDF fails to download.",
                                "OPEN", null, now.minusDays(1)));
                feedbackRepo.save(makeFeedback(u9, superAdmin1, "COMPLAINT", "Wrong premium charged",
                                "Charged higher premium.", "RESOLVED", "Refund processed.", now.minusDays(7)));
                feedbackRepo.save(makeFeedback(u10, null, "QUERY", "Nominee update", "How to update my nominee?",
                                "OPEN", null, now.minusHours(8)));
                System.out.println("Feedback seeded (10)");

                // == 8. Audit Logs ====================================================
                List<AuditLog> logs = new ArrayList<>();
                logs.add(makeLog("LOGIN", "USER", u1.getId(), u1.getId(), "USER", u1.getName(), "User logged in",
                                "INFO"));
                logs.add(makeLog("APPROVE", "BOOKING", bC1.getId(), ag1.getId(), "AGENT", ag1.getName(),
                                "Booking approved: " + u1.getName(), "INFO"));
                logs.add(makeLog("APPROVE", "BOOKING", bC2.getId(), ag4.getId(), "AGENT", ag4.getName(),
                                "Consultation completed", "INFO"));
                logs.add(makeLog("REJECT", "BOOKING", bR1.getId(), ag5.getId(), "AGENT", ag5.getName(),
                                "Booking rejected: high risk score", "WARNING"));
                logs.add(makeLog("CREATE", "CLAIM", cl6.getId(), u7.getId(), "USER", u7.getName(),
                                "Claim filed for car accident", "INFO"));
                logs.add(makeLog("APPROVE", "CLAIM", cl6.getId(), superAdmin1.getId(), "SUPER_ADMIN",
                                superAdmin1.getName(),
                                "Claim approved after inspection", "INFO"));
                logs.add(makeLog("REJECT", "CLAIM", cl9.getId(), superAdmin1.getId(), "SUPER_ADMIN",
                                superAdmin1.getName(),
                                "Claim rejected: fraudulent docs", "WARNING"));
                logs.add(makeLog("UPDATE", "POLICY", slP1.getId(), superAdmin1.getId(), "SUPER_ADMIN",
                                superAdmin1.getName(),
                                "Policy premium updated", "INFO"));
                logs.add(makeLog("CREATE", "USER", u15.getId(), superAdmin1.getId(), "SUPER_ADMIN",
                                superAdmin1.getName(),
                                "New user registered", "INFO"));
                logs.add(makeLog("LOGIN", "COMPANY", securLife.getId(), caSecureLife.getId(), "COMPANY_ADMIN",
                                caSecureLife.getName(), "Company admin login", "INFO"));
                logs.add(makeLog("CREATE", "FEEDBACK", fb5.getId(), u5.getId(), "USER", u5.getName(),
                                "Complaint raised about claim", "WARNING"));
                logs.add(makeLog("RESOLVE", "FEEDBACK", fb1.getId(), superAdmin1.getId(), "SUPER_ADMIN",
                                superAdmin1.getName(),
                                "Bug feedback resolved", "INFO"));
                auditLogRepo.saveAll(logs);
                System.out.println("Audit logs seeded (12)");

                System.out.println("DataSeeder complete! All data ready for demo.");
        }

        // =========================================================================
        // Helper builders
        // =========================================================================

        private Company saveCompany(String name, String email, String reg, String desc, String city) {
                Company c = new Company();
                c.setName(name);
                c.setEmail(email);
                c.setPassword(passwordEncoder.encode("password123"));
                c.setRegistrationNumber(reg);
                c.setDescription(desc);
                c.setStatus("APPROVED");
                c.setIsActive(true);
                c.setAddress(city);
                c.setPhone("1800-000-100");
                return companyRepo.save(c);
        }

        private Policy makePolicy(String name, String category, String type,
                        double premium, double coverage, Company company) {
                Policy p = new Policy();
                p.setName(name);
                p.setCategory(category);
                p.setType(type);
                p.setPremium(premium);
                p.setCoverage(coverage);
                p.setDescription(name + " - Comprehensive " + type + " protection.");
                p.setClaimSettlementRatio(94.0 + Math.random() * 5.9);
                p.setExclusions(new ArrayList<>());
                p.setWarnings(new ArrayList<>());
                p.setCompany(company);
                return p;
        }

        private User makeUser(String name, String email, String password, String role,
                        int age, String address, Double income, Integer dependents, String health) {
                User u = new User();
                u.setName(name);
                u.setEmail(email);
                u.setPassword(passwordEncoder.encode(password));
                u.setRole(role);
                u.setAge(age);
                u.setAddress(address);
                u.setIncome(income);
                u.setDependents(dependents);
                u.setHealthInfo(health);
                u.setIsActive(true);
                u.setVerified(true);
                return u;
        }

        private User makeAgent(String name, String email, Company company,
                        String specialization, double rating, String bio) {
                User a = new User();
                a.setName(name);
                a.setEmail(email);
                a.setPassword(passwordEncoder.encode("password123"));
                a.setRole("AGENT");
                a.setSpecialization(specialization);
                a.setRating(rating);
                a.setBio(bio);
                a.setIsActive(true);
                a.setAvailable(true);
                a.setCompany(company);
                return a;
        }

        private Booking makeBooking(User user, User agent, Policy policy,
                        String status, LocalDateTime start, LocalDateTime end) {
                Booking b = new Booking();
                b.setUser(user);
                b.setAgent(agent);
                b.setPolicy(policy);
                b.setStatus(status);
                b.setStartTime(start);
                b.setEndTime(end);
                b.setReason("Consultation for " + policy.getName());
                return b;
        }

        private UserPolicy makeUserPolicy(User user, Policy policy, String status,
                        Double premium, LocalDateTime purchasedAt) {
                UserPolicy up = new UserPolicy();
                up.setUser(user);
                up.setPolicy(policy);
                up.setStatus(status);
                up.setPremium(premium);
                up.setPurchasedAt(purchasedAt);
                return up;
        }

        private void saveUCM(User user, Company company, Policy policy) {
                UserCompanyMap ucm = new UserCompanyMap();
                ucm.setUser(user);
                ucm.setCompany(company);
                ucm.setPolicy(policy);
                ucm.setStatus("ACTIVE");
                userCompanyMapRepo.save(ucm);
        }

        private Claim makeClaim(User user, Policy policy, String type,
                        double amount, String status, double fraudScore, LocalDateTime date) {
                Claim c = new Claim();
                c.setUser(user);
                c.setPolicy(policy);
                c.setPolicyName(policy != null ? policy.getName() : "Unknown Policy");
                c.setClaimType(type);
                c.setAmount(amount);
                c.setStatus(status);
                c.setFraudScore(fraudScore);
                c.setDate(date);
                c.setDescription("Claim for " + type.toLowerCase() + " under "
                                + (policy != null ? policy.getName() : "policy"));
                c.setSuccessProbability(fraudScore < 0.3 ? 85 : fraudScore < 0.5 ? 60 : 30);
                c.setNextAction(
                                "INITIATED".equals(status) ? "Upload documents"
                                                : "DOCS_UPLOADED".equals(status) ? "Await agent review"
                                                                : "UNDER_REVIEW".equals(status)
                                                                                ? "Verification in progress"
                                                                                : "Complete");
                return c;
        }

        private Feedback makeFeedback(User user, User assignedTo, String category,
                        String subject, String description, String status,
                        String adminResponse, LocalDateTime createdAt) {
                Feedback f = new Feedback();
                f.setUser(user);
                f.setAssignedTo(assignedTo);
                f.setCategory(category);
                f.setSubject(subject);
                f.setDescription(description);
                f.setStatus(status);
                f.setAdminResponse(adminResponse);
                f.setCreatedAt(createdAt);
                if ("RESOLVED".equals(status)) {
                        f.setResolvedAt(createdAt.plusDays(2));
                }
                return f;
        }

        private AuditLog makeLog(String action, String entityType, Long entityId,
                        Long performedBy, String performedByRole,
                        String performedByName, String details, String severity) {
                AuditLog log = new AuditLog(action, entityType, entityId, performedBy, performedByRole,
                                performedByName);
                log.setDetails(details);
                log.setSeverity(severity);
                log.setIpAddress("192.168.1.100");
                return log;
        }
}
