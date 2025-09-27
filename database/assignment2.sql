-- assignment2.sql - Task One (6 queries)
-- This file uses primary-key-safe WHERE clauses by resolving the PK via a subquery
-- so the statements can be executed as-is and still follow the requirement to use PKs

-- 1) Insert Tony Stark (the PK will be generated automatically)
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2) Update Tony's account_type to Admin (uses PK via subquery to satisfy "use primary key in WHERE")
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = (
  SELECT account_id FROM public.account WHERE account_email = 'tony@starkent.com' LIMIT 1
);

-- 3) Delete Tony Stark (uses PK via subquery)
DELETE FROM public.account
WHERE account_id = (
  SELECT account_id FROM public.account WHERE account_email = 'tony@starkent.com' LIMIT 1
);

-- 4) Update GM Hummer description using REPLACE (uses PK via subquery)
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = (
  SELECT inv_id FROM public.inventory WHERE inv_make = 'GM' AND inv_model = 'Hummer' LIMIT 1
);

-- 5) Inner join: inv make, model and classification name for "Sport"
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6) Update all image paths to include /vehicles (updates inv_image and inv_thumbnail)
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
