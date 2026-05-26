package com.insurecrm.customer_service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock private CustomerRepository customerRepository;
    @InjectMocks private CustomerService customerService;

    private Customer buildCustomer(Long id, String email) {
        Customer c = new Customer();
        c.setId(id);
        c.setFirstName("John");
        c.setLastName("Doe");
        c.setEmail(email);
        c.setPhone("0501234567");
        c.setIsraeliId("123456789");
        c.setDateOfBirth(LocalDate.of(1990, 1, 1));
        c.setAgentEmail("agent@test.com");
        c.setStatus(Customer.CustomerStatus.ACTIVE);
        return c;
    }

    private CustomerRequest buildRequest(String email, Customer.CustomerStatus status) {
        return new CustomerRequest("John", "Doe", email, "0501234567",
                "123456789", LocalDate.of(1990, 1, 1), "agent@test.com", status);
    }

    @Test
    void create_validRequest_returnsCustomerResponse() {
        when(customerRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());
        when(customerRepository.findByIsraeliId("123456789")).thenReturn(Optional.empty());
        when(customerRepository.save(any())).thenReturn(buildCustomer(1L, "john@test.com"));

        CustomerResponse response = customerService.create(buildRequest("john@test.com", Customer.CustomerStatus.ACTIVE));

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("john@test.com");
        assertThat(response.status()).isEqualTo("ACTIVE");
        verify(customerRepository).save(any());
    }

    @Test
    void create_nullStatus_defaultsToProspect() {
        Customer saved = buildCustomer(1L, "john@test.com");
        saved.setStatus(Customer.CustomerStatus.PROSPECT);
        when(customerRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());
        when(customerRepository.findByIsraeliId("123456789")).thenReturn(Optional.empty());
        when(customerRepository.save(any())).thenReturn(saved);

        CustomerResponse response = customerService.create(buildRequest("john@test.com", null));

        assertThat(response.status()).isEqualTo("PROSPECT");
    }

    @Test
    void create_duplicateEmail_throwsException() {
        when(customerRepository.findByEmail("john@test.com"))
                .thenReturn(Optional.of(buildCustomer(1L, "john@test.com")));

        assertThatThrownBy(() -> customerService.create(buildRequest("john@test.com", Customer.CustomerStatus.ACTIVE)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already exists");

        verify(customerRepository, never()).save(any());
    }

    @Test
    void create_duplicateIsraeliId_throwsException() {
        when(customerRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(customerRepository.findByIsraeliId("123456789"))
                .thenReturn(Optional.of(buildCustomer(2L, "existing@test.com")));

        assertThatThrownBy(() -> customerService.create(buildRequest("new@test.com", Customer.CustomerStatus.ACTIVE)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Israeli ID already exists");

        verify(customerRepository, never()).save(any());
    }

    @Test
    void getAll_multipleCustomers_returnsList() {
        List<Customer> customers = List.of(buildCustomer(1L, "a@test.com"), buildCustomer(2L, "b@test.com"));
        when(customerRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(customers));

        Page<CustomerResponse> result = customerService.getAll(Pageable.unpaged());

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void getAll_noCustomers_returnsEmptyList() {
        when(customerRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        assertThat(customerService.getAll(Pageable.unpaged()).getContent()).isEmpty();
    }

    @Test
    void getById_existingId_returnsResponse() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(buildCustomer(1L, "john@test.com")));

        CustomerResponse response = customerService.getById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("john@test.com");
    }

    @Test
    void getById_notFound_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Customer not found");
    }

    @Test
    void update_existingCustomer_returnsUpdatedResponse() {
        Customer existing = buildCustomer(1L, "john@test.com");
        CustomerRequest request = new CustomerRequest("Jane", "Smith", "john@test.com",
                "0507654321", "123456789", LocalDate.of(1992, 5, 10),
                "agent2@test.com", Customer.CustomerStatus.INACTIVE);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CustomerResponse response = customerService.update(1L, request);

        assertThat(response.firstName()).isEqualTo("Jane");
        assertThat(response.status()).isEqualTo("INACTIVE");
        assertThat(response.agentEmail()).isEqualTo("agent2@test.com");
    }

    @Test
    void update_notFound_throwsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.update(99L, buildRequest("j@test.com", Customer.CustomerStatus.ACTIVE)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Customer not found");
    }

    @Test
    void delete_existingCustomer_callsDeleteById() {
        when(customerRepository.existsById(1L)).thenReturn(true);

        customerService.delete(1L);

        verify(customerRepository).deleteById(1L);
    }

    @Test
    void delete_notFound_throwsException() {
        when(customerRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> customerService.delete(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Customer not found");

        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void getByAgent_returnsCustomersForAgent() {
        when(customerRepository.findByAgentEmail("agent@test.com"))
                .thenReturn(List.of(buildCustomer(1L, "a@test.com"), buildCustomer(2L, "b@test.com")));

        List<CustomerResponse> result = customerService.getByAgent("agent@test.com");

        assertThat(result).hasSize(2);
    }

    @Test
    void getByAgent_noMatches_returnsEmptyList() {
        when(customerRepository.findByAgentEmail("nobody@agent.com")).thenReturn(Collections.emptyList());

        assertThat(customerService.getByAgent("nobody@agent.com")).isEmpty();
    }
}
