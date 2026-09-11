package com.ballpen.mes.service;

import com.ballpen.mes.dto.CreateProductRequest;
import com.ballpen.mes.dto.ProductDto;

import java.util.List;

public interface ProductService {

    List<ProductDto> getAllProducts();

    ProductDto getProductById(Long id);

    ProductDto createProduct(CreateProductRequest request);

    ProductDto updateProduct(Long id, CreateProductRequest request);

    void deleteProduct(Long id);

    ProductDto toggleStatus(Long id);
}
