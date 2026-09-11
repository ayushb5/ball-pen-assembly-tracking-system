package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateCustomerRequest;
import com.ballpen.mes.dto.CustomerDto;
import com.ballpen.mes.entity.Customer;
import com.ballpen.mes.enums.UserStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.CustomerRepository;
import com.ballpen.mes.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return CustomerDto.fromEntity(customer);
    }

    @Override
    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByCustomerCode(request.getCustomerCode())) {
            throw new BadRequestException("Customer code '" + request.getCustomerCode() + "' already exists");
        }

        Customer customer = Customer.builder()
                .customerCode(request.getCustomerCode())
                .customerName(request.getCustomerName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Created new customer: {} ({})", saved.getCustomerName(), saved.getCustomerCode());
        return CustomerDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Long id, CreateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (!customer.getCustomerCode().equals(request.getCustomerCode())
                && customerRepository.existsByCustomerCode(request.getCustomerCode())) {
            throw new BadRequestException("Customer code '" + request.getCustomerCode() + "' already exists");
        }

        customer.setCustomerCode(request.getCustomerCode());
        customer.setCustomerName(request.getCustomerName());
        customer.setContactPerson(request.getContactPerson());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }

        Customer updated = customerRepository.save(customer);
        log.info("Updated customer: {} ({})", updated.getCustomerName(), updated.getCustomerCode());
        return CustomerDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.delete(customer);
        log.info("Deleted customer with ID: {}", id);
    }

    @Override
    @Transactional
    public CustomerDto toggleStatus(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setStatus(customer.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        Customer updated = customerRepository.save(customer);
        log.info("Toggled customer {} status to {}", customer.getCustomerCode(), customer.getStatus());
        return CustomerDto.fromEntity(updated);
    }
}
