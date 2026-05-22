package com.insurecrm.customer_service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CustomerRepositoryTest {

    @PersistenceContext private EntityManager entityManager;
    @Autowired private CustomerRepository customerRepository;

    private Customer persist(String email, String israeliId, String phone,
                             String agentEmail, Customer.CustomerStatus status) {
        Customer c = new Customer();
        c.setFirstName("John");
        c.setLastName("Doe");
        c.setEmail(email);
        c.setPhone(phone);
        c.setIsraeliId(israeliId);
        c.setDateOfBirth(LocalDate.of(1990, 1, 1));
        c.setAgentEmail(agentEmail);
        c.setStatus(status);
        entityManager.persist(c);
        entityManager.flush();
        return c;
    }

    @Test
    void findByEmail_exists_returnsCustomer() {
        persist("john@test.com", "123456789", "0501234567", "agent@test.com", Customer.CustomerStatus.ACTIVE);

        var result = customerRepository.findByEmail("john@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("john@test.com");
    }

    @Test
    void findByEmail_notExists_returnsEmpty() {
        assertThat(customerRepository.findByEmail("nobody@test.com")).isEmpty();
    }

    @Test
    void findByIsraeliId_exists_returnsCustomer() {
        persist("john@test.com", "123456789", "0501234567", "agent@test.com", Customer.CustomerStatus.ACTIVE);

        var result = customerRepository.findByIsraeliId("123456789");

        assertThat(result).isPresent();
        assertThat(result.get().getIsraeliId()).isEqualTo("123456789");
    }

    @Test
    void findByIsraeliId_notExists_returnsEmpty() {
        assertThat(customerRepository.findByIsraeliId("000000000")).isEmpty();
    }

    @Test
    void findByAgentEmail_multipleCustomers_returnsAll() {
        persist("a@test.com", "111111111", "0501111111", "agent@test.com", Customer.CustomerStatus.ACTIVE);
        persist("b@test.com", "222222222", "0502222222", "agent@test.com", Customer.CustomerStatus.INACTIVE);

        List<Customer> result = customerRepository.findByAgentEmail("agent@test.com");

        assertThat(result).hasSize(2);
    }

    @Test
    void findByAgentEmail_noMatches_returnsEmpty() {
        List<Customer> result = customerRepository.findByAgentEmail("unknown@agent.com");
        assertThat(result).isEmpty();
    }

    @Test
    void findByStatus_active_returnsActiveCustomersOnly() {
        persist("active@test.com", "111111111", "0501111111", "agent@test.com", Customer.CustomerStatus.ACTIVE);
        persist("inactive@test.com", "222222222", "0502222222", "agent@test.com", Customer.CustomerStatus.INACTIVE);

        List<Customer> result = customerRepository.findByStatus(Customer.CustomerStatus.ACTIVE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(Customer.CustomerStatus.ACTIVE);
    }

    @Test
    void findByStatus_noMatch_returnsEmpty() {
        List<Customer> result = customerRepository.findByStatus(Customer.CustomerStatus.PROSPECT);
        assertThat(result).isEmpty();
    }
}
