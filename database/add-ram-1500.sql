-- Add RAM 1500 pickup truck to inventory
-- Run this script to add the RAM 1500 with proper image paths

INSERT INTO public.inventory (
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
) VALUES (
    'RAM',
    '1500',
    '2022',
    'The RAM 1500 delivers best-in-class capability with a smooth ride and luxurious interior. Perfect for work or play with impressive towing capacity and advanced technology features.',
    '/images/vehicles/ram-1500.jpg',
    '/images/vehicles/ram-1500-tn.jpg',
    35995,
    15420,
    'White',
    4  -- Assuming classification_id 4 is for Trucks
) 
ON CONFLICT DO NOTHING;

-- Verify the insertion
SELECT inv_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail 
FROM public.inventory 
WHERE inv_make = 'RAM' AND inv_model = '1500';