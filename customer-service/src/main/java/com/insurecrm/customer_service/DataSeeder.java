package com.insurecrm.customer_service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CustomerRepository customerRepository;

    public DataSeeder(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public void run(String... args) {
        if (customerRepository.count() > 0) return;

        List<Customer> customers = List.of(
                customer("Moshe", "Cohen", "moshe.cohen@gmail.com",
                        "0501234567", "123456782", LocalDate.of(1980, 3, 15),
                        "agent@insure.com", Customer.CustomerStatus.ACTIVE),
                customer("Yael", "Levi", "yael.levi@gmail.com",
                        "0507654321", "234567891", LocalDate.of(1990, 7, 22),
                        "agent@insure.com", Customer.CustomerStatus.ACTIVE),
                customer("David", "Mizrahi", "david.mizrahi@gmail.com",
                        "0521234567", "345678912", LocalDate.of(1975, 11, 8),
                        "agent@insure.com", Customer.CustomerStatus.PROSPECT),
                customer("Tamar", "Shapiro", "tamar.shapiro@gmail.com",
                        "0531234567", "456789123", LocalDate.of(1985, 5, 30),
                        "agent@insure.com", Customer.CustomerStatus.INACTIVE),
                customer("Avi", "Peretz", "avi.peretz@gmail.com",
                        "0541234567", "567891234", LocalDate.of(1995, 1, 12),
                        "agent@insure.com", Customer.CustomerStatus.ACTIVE)
        );

        customerRepository.saveAll(customers);
        System.out.println("Seeded " + customers.size() + " customers");
    }

    private Customer customer(String firstName, String lastName, String email,
                              String phone, String israeliId, LocalDate dob,
                              String agentEmail, Customer.CustomerStatus status) {
        Customer c = new Customer();
        c.setFirstName(firstName);
        c.setLastName(lastName);
        c.setEmail(email);
        c.setPhone(phone);
        c.setIsraeliId(israeliId);
        c.setDateOfBirth(dob);
        c.setAgentEmail(agentEmail);
        c.setStatus(status);
        return c;
    }
}