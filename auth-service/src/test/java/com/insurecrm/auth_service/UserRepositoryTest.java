package com.insurecrm.auth_service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class UserRepositoryTest {

    @PersistenceContext private EntityManager entityManager;
    @Autowired private UserRepository userRepository;

    private User persist(String email, User.Role role) {
        User u = new User();
        u.setEmail(email);
        u.setPassword("hashed");
        u.setRole(role);
        entityManager.persist(u);
        entityManager.flush();
        return u;
    }

    @Test
    void findByEmail_userExists_returnsUser() {
        persist("agent@test.com", User.Role.AGENT);

        var result = userRepository.findByEmail("agent@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("agent@test.com");
        assertThat(result.get().getRole()).isEqualTo(User.Role.AGENT);
    }

    @Test
    void findByEmail_userNotExists_returnsEmpty() {
        assertThat(userRepository.findByEmail("nobody@test.com")).isEmpty();
    }

    @Test
    void save_newUser_assignsId() {
        User u = new User();
        u.setEmail("newuser@test.com");
        u.setPassword("hashed");
        u.setRole(User.Role.MANAGER);

        User saved = userRepository.save(u);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getRole()).isEqualTo(User.Role.MANAGER);
    }

    @Test
    void save_duplicateEmail_throwsException() {
        persist("dup@test.com", User.Role.AGENT);
        entityManager.clear();

        User duplicate = new User();
        duplicate.setEmail("dup@test.com");
        duplicate.setPassword("hashed");
        duplicate.setRole(User.Role.AGENT);

        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
                .isInstanceOf(Exception.class);
    }

    @Test
    void findAll_multipleUsers_returnsAll() {
        persist("user1@test.com", User.Role.AGENT);
        persist("user2@test.com", User.Role.MANAGER);

        assertThat(userRepository.findAll()).hasSize(2);
    }
}
