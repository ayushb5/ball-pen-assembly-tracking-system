package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateDispatchRequest;
import com.ballpen.mes.dto.DispatchDto;
import com.ballpen.mes.entity.Customer;
import com.ballpen.mes.entity.Dispatch;
import com.ballpen.mes.entity.FinishedGoods;
import com.ballpen.mes.entity.ProductionOrder;
import com.ballpen.mes.enums.DispatchStatus;
import com.ballpen.mes.enums.FinishedGoodsStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.CustomerRepository;
import com.ballpen.mes.repository.DispatchRepository;
import com.ballpen.mes.repository.FinishedGoodsRepository;
import com.ballpen.mes.repository.ProductionOrderRepository;
import com.ballpen.mes.service.DispatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DispatchServiceImpl implements DispatchService {

    private final DispatchRepository dispatchRepository;
    private final CustomerRepository customerRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final FinishedGoodsRepository finishedGoodsRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DispatchDto> getAllDispatches() {
        return dispatchRepository.findAll().stream()
                .map(DispatchDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DispatchDto getDispatchById(Long id) {
        Dispatch d = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", "id", id));
        return DispatchDto.fromEntity(d);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DispatchDto> getDispatchesByCustomerId(Long customerId) {
        return dispatchRepository.findByCustomerId(customerId).stream()
                .map(DispatchDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DispatchDto createDispatch(CreateDispatchRequest request) {
        if (dispatchRepository.existsByDispatchNumber(request.getDispatchNumber())) {
            throw new BadRequestException("Dispatch number '" + request.getDispatchNumber() + "' already exists");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        Dispatch dispatch = Dispatch.builder()
                .dispatchNumber(request.getDispatchNumber())
                .customer(customer)
                .productionOrder(order)
                .quantity(request.getQuantity())
                .dispatchDate(request.getDispatchDate())
                .status(request.getStatus() != null ? request.getStatus() : DispatchStatus.PREPARING)
                .carrierName(request.getCarrierName() != null ? request.getCarrierName() : "Factory Dispatch Express")
                .trackingReference(request.getTrackingReference())
                .notes(request.getNotes())
                .build();

        Dispatch saved = dispatchRepository.save(dispatch);

        // Adjust FinishedGoods stock
        List<FinishedGoods> fgList = finishedGoodsRepository.findByProductionOrderId(order.getId());
        if (!fgList.isEmpty()) {
            FinishedGoods fg = fgList.get(0);
            if (saved.getStatus() == DispatchStatus.SHIPPED || saved.getStatus() == DispatchStatus.DELIVERED) {
                int rem = Math.max(0, fg.getQuantity() - saved.getQuantity());
                fg.setQuantity(rem);
                if (rem == 0) {
                    fg.setStatus(FinishedGoodsStatus.DISPATCHED);
                    fg.setReadyForDispatch(false);
                }
                finishedGoodsRepository.save(fg);
            }
        }

        log.info("Created shipment {} for customer {} ({} pens)",
                saved.getDispatchNumber(), customer.getCustomerName(), saved.getQuantity());
        return DispatchDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public DispatchDto updateDispatch(Long id, CreateDispatchRequest request) {
        Dispatch d = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", "id", id));

        if (!d.getDispatchNumber().equalsIgnoreCase(request.getDispatchNumber())
                && dispatchRepository.existsByDispatchNumber(request.getDispatchNumber())) {
            throw new BadRequestException("Dispatch number '" + request.getDispatchNumber() + "' already exists");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        ProductionOrder order = productionOrderRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductionOrder", "id", request.getProductionOrderId()));

        d.setDispatchNumber(request.getDispatchNumber());
        d.setCustomer(customer);
        d.setProductionOrder(order);
        d.setQuantity(request.getQuantity());
        d.setDispatchDate(request.getDispatchDate());
        if (request.getStatus() != null) {
            d.setStatus(request.getStatus());
        }
        d.setCarrierName(request.getCarrierName());
        d.setTrackingReference(request.getTrackingReference());
        d.setNotes(request.getNotes());

        Dispatch updated = dispatchRepository.save(d);
        log.info("Updated dispatch record {}", updated.getDispatchNumber());
        return DispatchDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public DispatchDto updateStatus(Long id, DispatchStatus status) {
        Dispatch d = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", "id", id));

        d.setStatus(status);
        Dispatch updated = dispatchRepository.save(d);

        // Adjust FinishedGoods stock when marked SHIPPED or DELIVERED
        if (status == DispatchStatus.SHIPPED || status == DispatchStatus.DELIVERED) {
            List<FinishedGoods> fgList = finishedGoodsRepository.findByProductionOrderId(d.getProductionOrder().getId());
            if (!fgList.isEmpty()) {
                FinishedGoods fg = fgList.get(0);
                int rem = Math.max(0, fg.getQuantity() - d.getQuantity());
                fg.setQuantity(rem);
                if (rem == 0) {
                    fg.setStatus(FinishedGoodsStatus.DISPATCHED);
                    fg.setReadyForDispatch(false);
                }
                finishedGoodsRepository.save(fg);
            }
        }

        log.info("Updated dispatch {} status to {}", d.getDispatchNumber(), status);
        return DispatchDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteDispatch(Long id) {
        Dispatch d = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", "id", id));
        dispatchRepository.delete(d);
        log.info("Deleted dispatch record {}", d.getDispatchNumber());
    }
}
