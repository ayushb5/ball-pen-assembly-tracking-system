-- ==============================================================================
-- Ball Pen Assembly Line Production Tracking System (MES)
-- Database Schema (DDL) for MySQL 8.0
-- Exactly 13 Normalized Relational Tables
-- ==============================================================================

-- 1. USERS TABLE (Authentication & Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. EMPLOYEES TABLE (Factory Floor & Administration Staff)
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CUSTOMERS TABLE (Wholesale & Retail Commercial Clients)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customers_code (customer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PRODUCTS TABLE (Ball Pen Catalog & Specifications)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL UNIQUE,
    product_name VARCHAR(100) NOT NULL,
    ink_color VARCHAR(30) NOT NULL,
    body_color VARCHAR(30) NOT NULL,
    pen_type VARCHAR(30) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_products_code (product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. RAW MATERIALS TABLE (Inventory for Assembly Parts)
CREATE TABLE IF NOT EXISTS raw_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(30) NOT NULL UNIQUE,
    material_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    minimum_stock INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_raw_materials_code (material_code),
    INDEX idx_raw_materials_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. PRODUCTION ORDERS TABLE (Customer-Driven Manufacturing Work Orders)
CREATE TABLE IF NOT EXISTS production_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    ordered_quantity INT NOT NULL,
    produced_quantity INT NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_po_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_po_number (order_number),
    INDEX idx_po_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. WORKSTATIONS TABLE (Assembly Line Machinery & Work Cells)
CREATE TABLE IF NOT EXISTS workstations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(20) NOT NULL UNIQUE,
    station_name VARCHAR(100) NOT NULL,
    station_type VARCHAR(50) NOT NULL,
    assigned_employee_id BIGINT,
    current_order_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'IDLE',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ws_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT fk_ws_order FOREIGN KEY (current_order_id) REFERENCES production_orders(id) ON DELETE SET NULL,
    INDEX idx_ws_code (station_code),
    INDEX idx_ws_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ASSEMBLY TRACKING TABLE (Sequential 8-Stage Manufacturing Progress)
CREATE TABLE IF NOT EXISTS assembly_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    production_order_id BIGINT NOT NULL,
    stage VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    started_time DATETIME,
    completed_time DATETIME,
    assigned_employee_id BIGINT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_track_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_track_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_track_order (production_order_id),
    INDEX idx_track_stage (stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. QUALITY CHECKS TABLE (QC Inspections, Pass & Defect Logging)
CREATE TABLE IF NOT EXISTS quality_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_number VARCHAR(30) NOT NULL UNIQUE,
    production_order_id BIGINT NOT NULL,
    checked_quantity INT NOT NULL,
    passed_quantity INT NOT NULL,
    rejected_quantity INT NOT NULL DEFAULT 0,
    rejection_reason VARCHAR(255),
    inspector_id BIGINT NOT NULL,
    inspection_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qc_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    CONSTRAINT fk_qc_inspector FOREIGN KEY (inspector_id) REFERENCES employees(id),
    INDEX idx_qc_number (check_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. PACKAGING TABLE (Boxing & Carton Lot Records)
CREATE TABLE IF NOT EXISTS packaging (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_number VARCHAR(30) NOT NULL UNIQUE,
    production_order_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    packed_by_id BIGINT NOT NULL,
    packing_date DATE NOT NULL,
    packaging_type VARCHAR(50) DEFAULT 'Standard Carton (100 pens)',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pkg_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    CONSTRAINT fk_pkg_packer FOREIGN KEY (packed_by_id) REFERENCES employees(id),
    INDEX idx_pkg_number (package_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. FINISHED GOODS TABLE (Warehouse Storage & Staging)
CREATE TABLE IF NOT EXISTS finished_goods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    production_order_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    warehouse_location VARCHAR(100) NOT NULL,
    ready_for_dispatch BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    received_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fg_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_fg_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    INDEX idx_fg_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. DISPATCH TABLE (Customer Deliveries & Logistics)
CREATE TABLE IF NOT EXISTS dispatch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispatch_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    production_order_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    dispatch_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PREPARING',
    carrier_name VARCHAR(100),
    tracking_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disp_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_disp_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    INDEX idx_disp_number (dispatch_number),
    INDEX idx_disp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. AUDIT LOGS TABLE (Operational Traceability & Action History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
