// scripts/init-dev-db.js
// Quick development database setup for testing

const { query, pool } = require('../database');

async function initializeDevDB() {
  console.log('Initializing development database...');
  
  try {
    // Create classification table
    await query(`
      CREATE TABLE IF NOT EXISTS public.classification (
        classification_id SERIAL PRIMARY KEY,
        classification_name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    
    // Create account table  
    await query(`
      CREATE TABLE IF NOT EXISTS public.account (
        account_id SERIAL PRIMARY KEY,
        account_firstname VARCHAR(50) NOT NULL,
        account_lastname VARCHAR(50) NOT NULL,
        account_email VARCHAR(100) NOT NULL UNIQUE,
        account_password VARCHAR(255) NOT NULL,
        account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin'))
      )
    `);
    
    // Create inventory table
    await query(`
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
      )
    `);
    
    // Insert sample classifications
    await query(`
      INSERT INTO public.classification (classification_name) 
      SELECT 'Custom' WHERE NOT EXISTS (SELECT 1 FROM public.classification WHERE classification_name = 'Custom')
      UNION ALL SELECT 'Sport' WHERE NOT EXISTS (SELECT 1 FROM public.classification WHERE classification_name = 'Sport')
      UNION ALL SELECT 'SUV' WHERE NOT EXISTS (SELECT 1 FROM public.classification WHERE classification_name = 'SUV')
      UNION ALL SELECT 'Truck' WHERE NOT EXISTS (SELECT 1 FROM public.classification WHERE classification_name = 'Truck')
      UNION ALL SELECT 'Sedan' WHERE NOT EXISTS (SELECT 1 FROM public.classification WHERE classification_name = 'Sedan')
    `);
    
    // Insert sample vehicles
    await query(`
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color, classification_id
      )
      SELECT 'DMC', 'Delorean', 1981, 'So fast it''s almost like traveling in time.', 
             '/images/vehicles/delorean.jpg', '/images/vehicles/delorean-tn.jpg', 
             25000, 77000, 'Silver', 1
      WHERE NOT EXISTS (SELECT 1 FROM public.inventory WHERE inv_make = 'DMC' AND inv_model = 'Delorean')
    `);
    
    console.log('✅ Database initialized successfully!');
    console.log('Sample data created:');
    console.log('- Classifications: Custom, Sport, SUV, Truck, Sedan');
    console.log('- Sample vehicle: DMC Delorean');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDevDB();
}

module.exports = { initializeDevDB };