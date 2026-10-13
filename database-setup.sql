-- =======================================================
-- Gym Membership Management System - MySQL Setup Script
-- =======================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS gym_management_db;
USE gym_management_db;

-- 2. Drop existing tables if re-running
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Users table (Stores Admins and Members)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- 'ADMIN' or 'MEMBER'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Membership Plans table
CREATE TABLE plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL, -- e.g. 30, 90, 365
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Memberships table (Assigns a plan to a member with validity dates)
CREATE TABLE memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

-- 6. Payments table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    membership_id BIGINT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH', -- 'CASH', 'CARD', 'UPI', 'BANK_TRANSFER'
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PAID', -- 'PAID', 'PENDING', 'FAILED'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE SET NULL
);

-- 7. Attendances table (Check-in / Check-out tracking)
CREATE TABLE attendances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN', -- 'CHECKED_IN', 'COMPLETED'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================================================
-- Seed Initial Sample Data for Quick Testing
-- =======================================================

-- Default Admin and Sample Members
-- Passwords stored for simplicity / demonstration (BCrypt / plain fallback in service)
INSERT INTO users (id, name, email, password, phone, role) VALUES
(1, 'Gym Administrator', 'admin@gym.com', 'admin123', '9876543210', 'ADMIN'),
(2, 'Alex Walker', 'alex@example.com', 'member123', '9876543211', 'MEMBER'),
(3, 'Sarah Connor', 'sarah@example.com', 'member123', '9876543212', 'MEMBER'),
(4, 'Michael Scott', 'michael@example.com', 'member123', '9876543213', 'MEMBER');

-- Sample Plans
INSERT INTO plans (id, name, price, duration_days, description, active) VALUES
(1, 'Bronze Monthly', 49.99, 30, 'Full gym floor access during regular opening hours.', TRUE),
(2, 'Silver Quarterly', 129.99, 90, 'Gym access + locker facility + 1 fitness assessment.', TRUE),
(3, 'Gold Annual', 449.99, 365, 'Unlimited 24/7 access, sauna, locker, and 2 guest passes/month.', TRUE);

-- Sample Memberships
INSERT INTO memberships (id, user_id, plan_id, start_date, end_date, status) VALUES
(1, 2, 1, CURDATE() - INTERVAL 10 DAY, CURDATE() + INTERVAL 20 DAY, 'ACTIVE'),
(2, 3, 2, CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 60 DAY, 'ACTIVE'),
(3, 4, 3, CURDATE() - INTERVAL 400 DAY, CURDATE() - INTERVAL 35 DAY, 'EXPIRED');

-- Sample Payments
INSERT INTO payments (id, user_id, membership_id, amount, payment_method, payment_date, status) VALUES
(1, 2, 1, 49.99, 'CARD', NOW() - INTERVAL 10 DAY, 'PAID'),
(2, 3, 2, 129.99, 'UPI', NOW() - INTERVAL 30 DAY, 'PAID'),
(3, 4, 3, 449.99, 'BANK_TRANSFER', NOW() - INTERVAL 400 DAY, 'PAID');

-- Sample Attendance
INSERT INTO attendances (id, user_id, date, check_in_time, check_out_time, status) VALUES
(1, 2, CURDATE(), NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 30 MINUTE, 'COMPLETED'),
(2, 3, CURDATE(), NOW() - INTERVAL 45 MINUTE, NULL, 'CHECKED_IN');
