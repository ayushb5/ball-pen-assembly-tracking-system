package com.ballpen.mes.service.impl;

import com.ballpen.mes.dto.CreateProductRequest;
import com.ballpen.mes.dto.ProductDto;
import com.ballpen.mes.entity.Product;
import com.ballpen.mes.enums.UserStatus;
import com.ballpen.mes.exception.BadRequestException;
import com.ballpen.mes.exception.ResourceNotFoundException;
import com.ballpen.mes.repository.ProductRepository;
import com.ballpen.mes.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductDto.fromEntity(product);
    }

    @Override
    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        if (productRepository.existsByProductCode(request.getProductCode())) {
            throw new BadRequestException("Product code '" + request.getProductCode() + "' already exists");
        }

        Product product = Product.builder()
                .productCode(request.getProductCode())
                .productName(request.getProductName())
                .inkColor(request.getInkColor())
                .bodyColor(request.getBodyColor())
                .penType(request.getPenType())
                .sellingPrice(request.getSellingPrice())
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        Product saved = productRepository.save(product);
        log.info("Created new product: {} ({})", saved.getProductName(), saved.getProductCode());
        return ProductDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getProductCode().equals(request.getProductCode())
                && productRepository.existsByProductCode(request.getProductCode())) {
            throw new BadRequestException("Product code '" + request.getProductCode() + "' already exists");
        }

        product.setProductCode(request.getProductCode());
        product.setProductName(request.getProductName());
        product.setInkColor(request.getInkColor());
        product.setBodyColor(request.getBodyColor());
        product.setPenType(request.getPenType());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        Product updated = productRepository.save(product);
        log.info("Updated product: {} ({})", updated.getProductName(), updated.getProductCode());
        return ProductDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
        log.info("Deleted product with ID: {}", id);
    }

    @Override
    @Transactional
    public ProductDto toggleStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setStatus(product.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        Product updated = productRepository.save(product);
        log.info("Toggled product {} status to {}", product.getProductCode(), product.getStatus());
        return ProductDto.fromEntity(updated);
    }
}
