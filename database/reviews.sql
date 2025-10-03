-- Reviews table for vehicle reviews and ratings
DROP TABLE IF EXISTS public.review CASCADE;

CREATE TABLE public.review (
  review_id SERIAL PRIMARY KEY,
  inv_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  review_title VARCHAR(100) NOT NULL,
  review_text TEXT NOT NULL,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  review_approved BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_review_inventory FOREIGN KEY (inv_id) REFERENCES public.inventory (inv_id) ON DELETE CASCADE,
  CONSTRAINT fk_review_account FOREIGN KEY (account_id) REFERENCES public.account (account_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_vehicle_review UNIQUE (inv_id, account_id)
);

-- Indexes for better performance
CREATE INDEX idx_review_inv_id ON public.review(inv_id);
CREATE INDEX idx_review_account_id ON public.review(account_id);
CREATE INDEX idx_review_approved ON public.review(review_approved);

-- Sample data (these will need approval by default since review_approved = FALSE)
INSERT INTO public.review (inv_id, account_id, review_title, review_text, review_rating, review_approved) VALUES
(1, 1, 'Amazing Sports Car!', 'This Lamborghini Aventador is absolutely incredible! The performance is mind-blowing and the sound is intoxicating. Every drive is an experience.', 5, TRUE),
(2, 1, 'Classic Beauty', 'The 1936 Aerocar is a true classic. Amazing restoration work and the history behind this vehicle is fascinating. A real head-turner!', 5, TRUE),
(3, 1, 'Iconic and Fun', 'The Batmobile is exactly what you would expect - fun, unique, and a real conversation starter. Great condition and runs smoothly.', 4, TRUE),
(1, 2, 'Dream Car Realized', 'Always wanted to own a Lamborghini and this one did not disappoint. Fast, beautiful, and surprisingly practical for daily use.', 5, FALSE),
(4, 1, 'American Muscle', 'The Camaro delivers on power and style. Great acceleration and that classic muscle car feel. Some minor interior wear but overall excellent.', 4, FALSE);

-- Create a view for easy review statistics
CREATE OR REPLACE VIEW review_stats AS
SELECT 
    i.inv_id,
    i.inv_make,
    i.inv_model,
    COUNT(r.review_id) as total_reviews,
    ROUND(AVG(r.review_rating), 1) as avg_rating,
    COUNT(CASE WHEN r.review_rating = 5 THEN 1 END) as five_star,
    COUNT(CASE WHEN r.review_rating = 4 THEN 1 END) as four_star,
    COUNT(CASE WHEN r.review_rating = 3 THEN 1 END) as three_star,
    COUNT(CASE WHEN r.review_rating = 2 THEN 1 END) as two_star,
    COUNT(CASE WHEN r.review_rating = 1 THEN 1 END) as one_star
FROM public.inventory i
LEFT JOIN public.review r ON i.inv_id = r.inv_id AND r.review_approved = TRUE
GROUP BY i.inv_id, i.inv_make, i.inv_model;