package com.insurai.config;

import com.insurai.model.Company;
import com.insurai.model.Policy;
import com.insurai.model.User;
import com.insurai.repository.CompanyRepository;
import com.insurai.repository.PolicyRepository;
import com.insurai.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

        private final PolicyRepository policyRepo;
        private final UserRepository userRepo;
        private final CompanyRepository companyRepo;
        private final PasswordEncoder passwordEncoder;

        public DataSeeder(PolicyRepository policyRepo, UserRepository userRepo, CompanyRepository companyRepo,
                        PasswordEncoder passwordEncoder) {
                this.policyRepo = policyRepo;
                this.userRepo = userRepo;
                this.companyRepo = companyRepo;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) throws Exception {
                long count = policyRepo.count();
                System.out.println("🌱 DataSeeder: Current Policy Count = " + count);

                // Ensure Users Exist (Admin, Agents, User)
                seedUsers();

                // Ensure Companies Exists
                List<Company> companies = companyRepo.findAll();
                if (companies.isEmpty()) {
                        System.out.println("🌱 Seeding Companies...");
                        companies.add(createCompany("InsurAI Life", "life@insurai.com", "LIC12345",
                                        "Life Insurance Corp"));
                        companies.add(createCompany("SecureGeneral", "general@secure.com", "GIC67890",
                                        "Secure General Insurance"));
                        companies.add(createCompany("HealthPlus", "health@plus.com", "HIC11223", "Health Plus Ltd"));
                        companies = companyRepo.saveAll(companies);
                }

                // Massive seed for full category list
                if (count < 20) {
                        System.out.println("🌱 Seeding Comprehensive Policy List...");

                        List<Policy> list = new ArrayList<>();
                        Random rand = new Random();

                        // 1. Personal Insurance
                        list.add(create("Term Life Insurance", "Personal Insurance", "Life", 500.0, 10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Term Plans with Return of Premium", "Personal Insurance", "Life", 900.0,
                                        5000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Term Insurance (Women)", "Personal Insurance", "Life", 450.0, 10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Term Life Insurance (Self Employed)", "Personal Insurance", "Life", 600.0,
                                        10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Term Life Insurance (NRIs)", "Personal Insurance", "Life", 2500.0, 30000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Home Loan Insurance", "Personal Insurance", "Loan", 300.0, 5000000.0,
                                        getRandCompany(companies, rand)));

                        // 2. Health Insurance
                        list.add(create("Health Insurance", "Health Insurance", "Health", 1200.0, 500000.0,
                                        getRandCompany(companies, rand)));
                        list.add(
                                        create("OPD Cover", "Health Insurance", "Health", 400.0, 50000.0,
                                                        getRandCompany(companies, rand)));
                        list.add(create("1 Cr Health Cover", "Health Insurance", "Health", 1500.0, 10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Arogya Sanjeevani", "Health Insurance", "Health", 800.0, 300000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Family Health Insurance", "Health Insurance", "Health", 2500.0, 1000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Cancer Insurance", "Health Insurance", "Critical", 600.0, 2500000.0,
                                        getRandCompany(companies, rand)));

                        // 3. Investment Plans
                        list.add(create("LIC Plans", "Investment Plans", "Investment", 2000.0, 500000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Child Savings Plans", "Investment Plans", "Investment", 1500.0, 2000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Guaranteed Return Plans", "Investment Plans", "Investment", 5000.0, 1000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Retirement Plan", "Investment Plans", "Pension", 3000.0, 20000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Tax Saving Investment", "Investment Plans", "Investment", 12500.0, 150000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Pension For Life", "Investment Plans", "Pension", 10000.0, 50000.0,
                                        getRandCompany(companies, rand))); // Monthly payout
                        list.add(create("Smart Deposit", "Investment Plans", "Investment", 5000.0, 500000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("ULIPs", "Investment Plans", "ULIP", 4000.0, 5000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Dollar Based Investment Plan", "Investment Plans", "Global", 10000.0,
                                        1000000.0,
                                        getRandCompany(companies, rand)));

                        // 4. Other Plans
                        list.add(create("Car Insurance", "Other Plans", "Car", 500.0, 300000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Brand New Car", "Other Plans", "Car", 1200.0, 800000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("2 Wheeler Insurance", "Other Plans", "Bike", 100.0, 50000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Travel Insurance", "Other Plans", "Travel", 800.0, 5000000.0,
                                        getRandCompany(companies, rand))); // One time
                        list.add(
                                        create("Home Insurance", "Other Plans", "Home", 200.0, 2000000.0,
                                                        getRandCompany(companies, rand)));
                        list.add(create("Taxi Insurance", "Other Plans", "Commercial", 1500.0, 500000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Commercial Vehicle", "Other Plans", "Commercial", 2500.0, 1000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Pet Insurance", "Other Plans", "Pet", 300.0, 50000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Personal Cyber Insurance", "Other Plans", "Cyber", 150.0, 100000.0,
                                        getRandCompany(companies, rand)));

                        // 5. Business Insurance
                        list.add(create("Marine Insurance", "Business Insurance", "Marine", 2000.0, 5000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Fire & Burglary", "Business Insurance", "Property", 1000.0, 2000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Shop Owner Insurance", "Business Insurance", "SME", 800.0, 1000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Office Package Policy", "Business Insurance", "Office", 1500.0, 2500000.0,
                                        getRandCompany(companies, rand)));

                        // 6. Employee Benefits
                        list.add(create("Employee Group Health Insurance", "Employee Benefits", "Group Health", 10000.0,
                                        500000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Group Personal Accident", "Employee Benefits", "Group Accident", 5000.0,
                                        1000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Group Term Life", "Employee Benefits", "Group Life", 8000.0, 2000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("COVID-19 Group Health Plan", "Employee Benefits", "Group Health", 2000.0,
                                        200000.0,
                                        getRandCompany(companies, rand)));

                        // 7. Liability
                        list.add(create("Professional Indemnity (Doctors)", "Liability", "Professional", 1200.0,
                                        5000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Professional Indemnity (Companies)", "Liability", "Professional", 2500.0,
                                        10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Workmen Compensation", "Liability", "Legal", 1800.0, 2000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("General Liability", "Liability", "Legal", 1500.0, 5000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Cyber Risk Insurance", "Liability", "Cyber", 3000.0, 10000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Directors & Officers Liability", "Liability", "D&O", 4000.0, 20000000.0,
                                        getRandCompany(companies, rand)));

                        // 8. Engineering
                        list.add(create("Contractor's All Risk", "Engineering", "Construction", 5000.0, 50000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Erection All Risk", "Engineering", "Construction", 5500.0, 50000000.0,
                                        getRandCompany(companies, rand)));
                        list.add(create("Contractor's Plant & Machinery", "Engineering", "Machinery", 3000.0,
                                        10000000.0,
                                        getRandCompany(companies, rand)));

                        policyRepo.saveAll(list);

                        System.out.println("✅ Comprehensive Policies Seeded & Assigned to Companies!");
                }

                // Initialize Agents (Specialization)
                populateRequiredCompanies();
                ensureCompanyPolicies();
                updateAgentProfiles();
        }

        private void seedUsers() {
                if (userRepo.count() == 0) {
                        System.out.println("🌱 Seeding Users...");

                        // 1. Admin
                        User admin = new User();
                        admin.setName("Admin User");
                        admin.setEmail("admin@insurai.com");
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        admin.setRole("ADMIN");
                        admin.setIsActive(true);
                        userRepo.save(admin);

                        // 2. User_2 (Demo User)
                        User user = new User();
                        user.setName("User_2 Demo");
                        user.setEmail("user2@insurai.com"); // Assuming this is the demo user
                        user.setPassword(passwordEncoder.encode("password123"));
                        user.setRole("USER");
                        user.setAge(30);
                        user.setAddress("Chennai");
                        user.setIsActive(true);
                        userRepo.save(user);

                        // 3. Agents
                        createAgent("Agent Smith", "agent1@insurai.com", "Life & Health");
                        createAgent("Agent Doe", "agent2@insurai.com", "Motor & Corporate");
                        createAgent("Agent Johnson", "agent3@insurai.com", "General");

                        System.out.println("✅ Users Seeded (Admin, User_2, 3 Agents)");
                }
        }

        private void createAgent(String name, String email, String specialization) {
                User agent = new User();
                agent.setName(name);
                agent.setEmail(email);
                agent.setPassword(passwordEncoder.encode("password123"));
                agent.setRole("AGENT");
                agent.setSpecialization(specialization);
                agent.setRating(4.8);
                agent.setIsActive(true);
                agent.setAvailable(true);
                agent.setBio("Experienced agent in " + specialization);
                userRepo.save(agent);
        }

        private void populateRequiredCompanies() {
                System.out.println("🌱 Ensuring Required Companies & Policies...");
                String[][] required = {
                                { "SafeGuard", "safeguard@example.com", "REG-98255" },
                                { "SecureLife", "securelife@example.com", "REG-30264" },
                                { "TrustShield", "trustshield@example.com", "REG-61645" },
                                { "FutureProtect", "futureprotect@example.com", "REG-8396" },
                                { "ReliableInsure", "reliableinsure@example.com", "REG-94142" },
                                { "GlobalCover", "globalcover@example.com", "REG-17480" },
                                { "PrimeAssure", "primeassure@example.com", "REG-52598" },
                                { "EliteCare", "elitecare@example.com", "REG-72487" },
                                { "UnityMutual", "unitymutual@example.com", "REG-1113" },
                                { "ApexSurance", "apexsurance@example.com", "REG-83217" }
                };

                for (String[] data : required) {
                        String name = data[0];
                        String email = data[1];
                        String reg = data[2];

                        Company c = companyRepo.findByEmail(email).orElse(null);
                        if (c == null) {
                                // Try finding by name to avoid duplicates if email mismatch
                                c = companyRepo.findAll().stream().filter(comp -> comp.getName().equalsIgnoreCase(name))
                                                .findFirst().orElse(null);
                                if (c == null) {
                                        System.out.println("   Creating Company: " + name);
                                        c = createCompany(name, email, reg, name + " Ltd.");
                                        if (c != null) {
                                                c = companyRepo.save(c);
                                        }
                                }
                        }

                        // Ensure policies
                        if (c != null && policyRepo.findByCompanyId(c.getId()).size() < 4) {
                                System.out.println("   Seeding Policies for: " + name);
                                List<Policy> policies = new ArrayList<>();
                                policies.add(create(name + " Term Life", "Personal Insurance", "Life", 500.0, 5000000.0,
                                                c));
                                policies.add(create(name + " Health Plus", "Health Insurance", "Health", 800.0,
                                                500000.0, c));
                                policies.add(create(name + " Wealth Builder", "Investment Plans", "Investment", 2000.0,
                                                1000000.0, c));
                                policies.add(create(name + " Business Shield", "Business Insurance", "Property", 1500.0,
                                                2000000.0, c));
                                policies.add(create(name + " Group Care", "Employee Benefits", "Group Health", 5000.0,
                                                200000.0, c));
                                policies.add(create(name + " Professional Cover", "Liability", "Professional", 1200.0,
                                                5000000.0, c));
                                policies.add(create(name + " Contractor All Risk", "Engineering", "Construction",
                                                4000.0, 10000000.0, c));
                                policies.add(create(name + " Travel Secure", "Other Plans", "Travel", 300.0, 100000.0,
                                                c));
                                policyRepo.saveAll(policies);
                        }
                }
        }

        private void ensureCompanyPolicies() {
                System.out.println("✅ Checking policies for all companies...");
                List<Company> companies = companyRepo.findAll();
                for (Company c : companies) {
                        List<Policy> policies = policyRepo.findByCompanyId(c.getId());
                        if (policies.isEmpty()) {
                                System.out.println("🌱 Seeding policies for " + c.getName());
                                List<Policy> newPolicies = new ArrayList<>();
                                // Add basic policies for this company
                                newPolicies.add(create(c.getName() + " Basic Health", "Health Insurance", "Health",
                                                500.0, 500000.0, c));
                                newPolicies.add(create(c.getName() + " Premium Life", "Personal Insurance", "Life",
                                                1200.0, 10000000.0, c));
                                newPolicies.add(create(c.getName() + " Safe Drive", "Other Plans", "Car", 800.0,
                                                800000.0, c));
                                policyRepo.saveAll(newPolicies);
                        }
                }
        }

        private Company createCompany(String name, String email, String regNum, String description) {
                Company c = new Company();
                c.setName(name);
                c.setEmail(email);
                // Default password 'password123'
                c.setPassword(passwordEncoder.encode("password123"));
                c.setRegistrationNumber(regNum);
                c.setDescription(description);
                c.setStatus("APPROVED");
                c.setIsActive(true);
                c.setAddress("Cyber City, Gurugram");
                c.setPhone("1800-111-222");
                return c;
        }

        private Company getRandCompany(List<Company> companies, Random rand) {
                if (companies.isEmpty())
                        return null;
                return companies.get(rand.nextInt(companies.size()));
        }

        private void updateAgentProfiles() {
                // Fix existing policies with no company
                List<Policy> orphanPolicies = policyRepo.findAll().stream().filter(p -> p.getCompany() == null)
                                .toList();
                List<Company> companies = companyRepo.findAll();
                if (!orphanPolicies.isEmpty() && !companies.isEmpty()) {
                        Random rand = new Random();
                        for (Policy p : orphanPolicies) {
                                p.setCompany(getRandCompany(companies, rand));
                        }
                        policyRepo.saveAll(orphanPolicies);
                        System.out.println("✅ Assigned " + orphanPolicies.size()
                                        + " orphan policies to random companies.");
                }

                java.util.List<User> agents = userRepo.findByRole("AGENT");
                boolean updated = false;
                for (User a : agents) {
                        if (a.getSpecialization() == null) {
                                a.setSpecialization(a.getId() % 2 == 0 ? "Life & Health" : "Motor & Corporate");

                                // Initialize rating only if not set
                                if (a.getRating() == null) {
                                        a.setRating(4.5 + (a.getId() % 5) / 10.0);
                                }

                                a.setBio("Certified " + a.getSpecialization() + " expert.");
                                userRepo.save(a);
                                updated = true;
                        }
                }
                if (updated) {
                        System.out.println("✅ Agent profiles updated with specializations.");
                }
        }

        private Policy create(String name, String category, String type, Double premium, Double coverage,
                        Company company) {
                Policy p = new Policy();
                p.setName(name);
                p.setCategory(category);
                p.setType(type);
                p.setPremium(premium);
                p.setCoverage(coverage);
                p.setDescription(name + " - Best in class protection for your needs.");
                p.setClaimSettlementRatio(95.0 + (Math.random() * 4.9)); // Random 95-99.9%
                p.setExclusions(new ArrayList<>());
                p.setWarnings(new ArrayList<>());
                p.setCompany(company); // Assign Company
                return p;
        }
}
