-- Drop tables if they exist
DROP TABLE IF EXISTS approvals;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS currency;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL, -- Used as 'name' in frontend
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    approved_budget_list JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(15,2) NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    manager VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    allocated_budget DECIMAL(15,2) NOT NULL,
    used_budget DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create currency table
CREATE TABLE IF NOT EXISTS currency (
    currency_code VARCHAR(10) PRIMARY KEY,
    currency_type VARCHAR(50),
    exchange_rate DECIMAL(15,6)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(100),
    parameters JSON,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trigger to update department spent amount when transactions are added
DELIMITER //
CREATE TRIGGER update_department_spent_insert AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    UPDATE departments 
    SET spent = COALESCE((
        SELECT SUM(amount) 
        FROM transactions 
        WHERE department_id = NEW.department_id
    ), 0)
    WHERE id = NEW.department_id;
END//

-- Create trigger to update department spent amount when transactions are deleted
CREATE TRIGGER update_department_spent_delete AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    UPDATE departments 
    SET spent = COALESCE((
        SELECT SUM(amount) 
        FROM transactions 
        WHERE department_id = OLD.department_id
    ), 0)
    WHERE id = OLD.department_id;
END//

-- Create trigger to update department spent amount when transactions are updated
CREATE TRIGGER update_department_spent_update AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    UPDATE departments 
    SET spent = COALESCE((
        SELECT SUM(amount) 
        FROM transactions 
        WHERE department_id = NEW.department_id
    ), 0)
    WHERE id = NEW.department_id;
    
    -- If the department_id was changed, update the old department's spent amount as well
    IF OLD.department_id != NEW.department_id THEN
        UPDATE departments 
        SET spent = COALESCE((
            SELECT SUM(amount) 
            FROM transactions 
            WHERE department_id = OLD.department_id
        ), 0)
        WHERE id = OLD.department_id;
    END IF;
END//

DELIMITER ;

-- hey i have the 