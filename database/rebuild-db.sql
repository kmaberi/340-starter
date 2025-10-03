-- 4) Fix GM Hummer description
UPDATE public.inventory
   SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
     )
 WHERE inv_make = 'GM'
   AND inv_model = 'Hummer';

-- 6) Prepend '/vehicles' into every image + thumbnail path
UPDATE public.inventory
   SET inv_image     = REPLACE(inv_image,     '/images/', '/images/vehicles/'),
       inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');   

-- Fix GM Hummer description
UPDATE public.inventory
   SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
     )
 WHERE inv_make = 'GM'
   AND inv_model = 'Hummer';

-- Prepend '/vehicles' into every image + thumbnail path
UPDATE public.inventory
   SET inv_image     = REPLACE(inv_image,     '/images/', '/images/vehicles/'),
       inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

      