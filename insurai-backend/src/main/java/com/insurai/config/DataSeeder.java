package com.insurai.config;

import com.insurai.model.Policy;
import com.insurai.repository.PolicyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PolicyRepository policyRepo;

    public DataSeeder(PolicyRepository policyRepo) {
        this.policyRepo = policyRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Massive seed for full category list
        if (policyRepo.count() < 20) {
            System.out.println("🌱 Seeding Comprehensive Policy List...");

            java.util.List<Policy> list = new ArrayList<>();

            // 1. Personal Insurance
            list.add(create("Term Life Insurance", "Personal Insurance", "Life", 500.0, 10000000.0));
            list.add(create("Term Plans with Return of Premium", "Personal Insurance", "Life", 900.0, 5000000.0));
            list.add(create("Term Insurance (Women)", "Personal Insurance", "Life", 450.0, 10000000.0));
            list.add(create("Term Life Insurance (Self Employed)", "Personal Insurance", "Life", 600.0, 10000000.0));
            list.add(create("Term Life Insurance (NRIs)", "Personal Insurance", "Life", 2500.0, 30000000.0));
            list.add(create("Home Loan Insurance", "Personal Insurance", "Loan", 300.0, 5000000.0));

            // 2. Health Insurance
            list.add(create("Health Insurance", "Health Insurance", "Health", 1200.0, 500000.0));
            list.add(create("OPD Cover", "Health Insurance", "Health", 400.0, 50000.0));
            list.add(create("1 Cr Health Cover", "Health Insurance", "Health", 1500.0, 10000000.0));
            list.add(create("Arogya Sanjeevani", "Health Insurance", "Health", 800.0, 300000.0));
            list.add(create("Family Health Insurance", "Health Insurance", "Health", 2500.0, 1000000.0));
            list.add(create("Cancer Insurance", "Health Insurance", "Critical", 600.0, 2500000.0));

            // 3. Investment Plans
            list.add(create("LIC Plans", "Investment Plans", "Investment", 2000.0, 500000.0));
            list.add(create("Child Savings Plans", "Investment Plans", "Investment", 1500.0, 2000000.0));
            list.add(create("Guaranteed Return Plans", "Investment Plans", "Investment", 5000.0, 1000000.0));
            list.add(create("Retirement Plan", "Investment Plans", "Pension", 3000.0, 20000000.0));
            list.add(create("Tax Saving Investment", "Investment Plans", "Investment", 12500.0, 150000.0));
            list.add(create("Pension For Life", "Investment Plans", "Pension", 10000.0, 50000.0)); // Monthly payout
            list.add(create("Smart Deposit", "Investment Plans", "Investment", 5000.0, 500000.0));
            list.add(create("ULIPs", "Investment Plans", "ULIP", 4000.0, 5000000.0));
            list.add(create("Dollar Based Investment Plan", "Investment Plans", "Global", 10000.0, 1000000.0));

            // 4. Other Plans
            list.add(create("Car Insurance", "Other Plans", "Car", 500.0, 300000.0));
            list.add(create("Brand New Car", "Other Plans", "Car", 1200.0, 800000.0));
            list.add(create("2 Wheeler Insurance", "Other Plans", "Bike", 100.0, 50000.0));
            list.add(create("Travel Insurance", "Other Plans", "Travel", 800.0, 5000000.0)); // One time
            list.add(create("Home Insurance", "Other Plans", "Home", 200.0, 2000000.0));
            list.add(create("Taxi Insurance", "Other Plans", "Commercial", 1500.0, 500000.0));
            list.add(create("Commercial Vehicle", "Other Plans", "Commercial", 2500.0, 1000000.0));
            list.add(create("Pet Insurance", "Other Plans", "Pet", 300.0, 50000.0));
            list.add(create("Personal Cyber Insurance", "Other Plans", "Cyber", 150.0, 100000.0));

            // 5. Business Insurance
            list.add(create("Marine Insurance", "Business Insurance", "Marine", 2000.0, 5000000.0));
            list.add(create("Fire & Burglary", "Business Insurance", "Property", 1000.0, 2000000.0));
            list.add(create("Shop Owner Insurance", "Business Insurance", "SME", 800.0, 1000000.0));
            list.add(create("Office Package Policy", "Business Insurance", "Office", 1500.0, 2500000.0));

            // 6. Employee Benefits
            list.add(create("Employee Group Health Insurance", "Employee Benefits", "Group Health", 10000.0, 500000.0));
            list.add(create("Group Personal Accident", "Employee Benefits", "Group Accident", 5000.0, 1000000.0));
            list.add(create("Group Term Life", "Employee Benefits", "Group Life", 8000.0, 2000000.0));
            list.add(create("COVID-19 Group Health Plan", "Employee Benefits", "Group Health", 2000.0, 200000.0));

            // 7. Liability
            list.add(create("Professional Indemnity (Doctors)", "Liability", "Professional", 1200.0, 5000000.0));
            list.add(create("Professional Indemnity (Companies)", "Liability", "Professional", 2500.0, 10000000.0));
            list.add(create("Workmen Compensation", "Liability", "Legal", 1800.0, 2000000.0));
            list.add(create("General Liability", "Liability", "Legal", 1500.0, 5000000.0));
            list.add(create("Cyber Risk Insurance", "Liability", "Cyber", 3000.0, 10000000.0));
            list.add(create("Directors & Officers Liability", "Liability", "D&O", 4000.0, 20000000.0));

            // 8. Engineering
            list.add(create("Contractor's All Risk", "Engineering", "Construction", 5000.0, 50000000.0));
            list.add(create("Erection All Risk", "Engineering", "Construction", 5500.0, 50000000.0));
            list.add(create("Contractor's Plant & Machinery", "Engineering", "Machinery", 3000.0, 10000000.0));

            policyRepo.saveAll(list);

            System.out.println("✅ Comprehensive Policies Seeded!");
        }
    }

    private Policy create(String name, String category, String type, Double premium, Double coverage) {
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
        return p;
    }
}
