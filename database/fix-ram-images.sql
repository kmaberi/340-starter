-- Fix RAM vehicle image paths
-- This script will update any existing RAM entries to use the correct image paths

-- Update RAM 1500 image paths if they exist
UPDATE public.inventory 
SET 
    inv_image = '/images/vehicles/ram-1500.jpg',
    inv_thumbnail = '/images/vehicles/ram-1500-tn.jpg'
WHERE inv_make = 'RAM' AND inv_model = '1500';

-- Update any RAM entries that might have incorrect paths
UPDATE public.inventory 
SET 
    inv_image = CASE 
        WHEN inv_image NOT LIKE '/images/vehicles/%' THEN REPLACE(inv_image, '/images/', '/images/vehicles/')
        ELSE inv_image 
    END,
    inv_thumbnail = CASE 
        WHEN inv_thumbnail NOT LIKE '/images/vehicles/%' THEN REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
        ELSE inv_thumbnail 
    END
WHERE inv_make = 'RAM';

-- Show the updated RAM entries
SELECT inv_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail 
FROM public.inventory 
WHERE inv_make = 'RAM';