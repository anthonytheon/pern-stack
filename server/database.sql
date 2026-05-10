-- CREATE DATABASE
CREATE DATABASE gst_job_order;

-- =========================
-- JOB ORDERS TABLE
-- =========================

CREATE TABLE job_orders (
    job_order_id SERIAL PRIMARY KEY,

    jo_number VARCHAR(20) UNIQUE NOT NULL,

    -- EXPORT / IMPORT / DOMESTIC
    jo_type VARCHAR(20) NOT NULL,

    -- COMMON FIELDS
    shipper_name VARCHAR(255),
    consignee_name VARCHAR(255),
    volume VARCHAR(50),
    shipping_line VARCHAR(255),
    voyage_name VARCHAR(255),
    port_of_loading VARCHAR(255),
    port_of_discharge VARCHAR(255),
    person_in_charge VARCHAR(255),
    eta DATE,
    etd DATE,
    goods TEXT,
    
    -- EXPORT / DOMESTIC FIELDS
    loading_date DATE,
    closing_date DATE,
    
    -- IMPORT FIELDS
    aju_number VARCHAR(50),
    sppb_date DATE,
    dooring_date DATE,

    -- EXTRA
    extra_note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);