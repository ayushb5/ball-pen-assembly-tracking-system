package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateCustomerRequest;
import com.ballpen.mes.dto.CustomerDto;

import java.util.List;

public interface CustomerService {

    List<CustomerDto> getAllCustomers();

    CustomerDto getCustomerById(Long id);

    CustomerDto createCustomer(CreateCustomerRequest request);

    CustomerDto updateCustomer(Long id, CreateCustomerRequest request);

    void deleteCustomer(Long id);

    CustomerDto toggleStatus(Long id);
}
