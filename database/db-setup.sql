-- database/db-setup.sql
-- Create tables for CSE Motors application

-- Create classification table
CREATE TABLE IF NOT EXISTS public.classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create account table  
CREATE TABLE IF NOT EXISTS public.account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) NOT NULL UNIQUE,
  account_password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin'))
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_year INTEGER NOT NULL CHECK (inv_year >= 1900 AND inv_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
  inv_description TEXT,
  inv_image VARCHAR(200),
  inv_thumbnail VARCHAR(200),
  inv_price DECIMAL(10,2) NOT NULL CHECK (inv_price >= 0),
  inv_miles INTEGER NOT NULL CHECK (inv_miles >= 0),
  inv_color VARCHAR(50),
  classification_id INTEGER NOT NULL,
  FOREIGN KEY (classification_id) REFERENCES classification(classification_id)
);

-- Insert sample classifications
INSERT INTO public.classification (classification_name) VALUES
('Custom'), ('Sport'), ('SUV'), ('Truck'), ('Sedan')
ON CONFLICT (classification_name) DO NOTHING;

-- Insert sample vehicles
INSERT INTO public.inventory (
  inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
  inv_price, inv_miles, inv_color, classification_id
) VALUES
('DMC', 'Delorean', 1981, 'So fast it''s almost like traveling in time.', 
 '/images/vehicles/delorean.jpg', '/images/vehicles/delorean-tn.jpg', 
 25000, 77000, 'Silver', 1),
('Ford', 'Model T', 1908, 'The original car that started it all.', 
 '/images/vehicles/model-t.jpg', '/images/vehicles/model-t-tn.jpg', 
 15000, 999999, 'Black', 1)
ON CONFLICT DO NOTHING;

-- Create an admin user (password is 'Admin123!')
-- Note: In production, this should be done through the application
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES
('Admin', 'User', 'admin@cse340.com', '$2b$10$8E8L8ZqNtQ9C9xKwFvQnau5o7VvKIp/kE9pYlv.XMCm/P5H3JQ8Sm', 'Admin')
ON CONFLICT (account_email) DO NOTHING;