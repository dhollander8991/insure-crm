package com.insurecrm.policy_service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @PostMapping
    public ResponseEntity<PolicyResponse> create(@Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<PolicyResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(policyService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PolicyResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.ok(policyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        policyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PolicyResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(policyService.getByCustomer(customerId));
    }

    @GetMapping("/agent/{agentEmail}")
    public ResponseEntity<List<PolicyResponse>> getByAgent(@PathVariable String agentEmail) {
        return ResponseEntity.ok(policyService.getByAgent(agentEmail));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PolicyResponse>> getByStatus(@PathVariable Policy.PolicyStatus status) {
        return ResponseEntity.ok(policyService.getByStatus(status));
    }
}