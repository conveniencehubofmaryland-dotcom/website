-- ============================================================
-- Convenience Hub of Maryland — Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- Services
insert into public.services (slug, title, subtitle, description, price_from, pricing_details, sort_order) values
(
  'cleaning',
  'Professional Cleaning & Estate Care',
  'Homes • Apartments • Offices • Retail • Warehouses',
  'Individual shifts, executive residency, and recurring plans. Consistent, professional care every visit.',
  'From $49.99/hr',
  '[
    {"label": "Individual Shift (≤ 4 hrs)", "price": "$54.99", "unit": "/hr"},
    {"label": "Individual Shift (5+ hrs)", "price": "$49.99", "unit": "/hr"},
    {"label": "Weekly / Bi-weekly / Monthly", "price": "Discounted Rates", "unit": "", "note": "Contact us for a custom plan"},
    {"label": "Executive Residency", "price": "Custom Quote", "unit": "", "note": "5-day/week plan, dedicated staff"}
  ]'::jsonb,
  1
),
(
  'culinary',
  'Culinary & Housekeeping',
  '6-hour minimum',
  'Light cooking, meal prep, tidying, laundry, errands, and deep organization. Custom rates based on your needs.',
  'From $50/hr',
  '[
    {"label": "Custom Hourly Rate", "price": "$50–$60", "unit": "/hr", "note": "Negotiable based on home size & tasks"},
    {"label": "5-Day Specialized Support", "price": "Custom Quote", "unit": "", "note": "Dedicated staff for total household ownership"},
    {"label": "Errands & Concierge", "price": "$0.725", "unit": "/mile", "note": "Shopping, appointments & more"}
  ]'::jsonb,
  2
),
(
  'laundry',
  'Laundry Pickup & Delivery',
  'We Pickup • Wash • Dry • Fold • Deliver',
  'Regular 1–3 day turnaround or same-day express. Colors, bedding, and whites. Minimum 10 lbs.',
  'From $3.99/lb',
  '[
    {"label": "Regular Colors (1–3 days)", "price": "$3.99", "unit": "/lb"},
    {"label": "Regular Bedding (1–3 days)", "price": "$4.99", "unit": "/lb"},
    {"label": "Regular Whites (1–3 days)", "price": "$6.99", "unit": "/lb"},
    {"label": "Same Day Express Colors", "price": "$5.99", "unit": "/lb"},
    {"label": "Same Day Express Bedding", "price": "$6.99", "unit": "/lb"},
    {"label": "Same Day Express Whites", "price": "$8.99", "unit": "/lb"}
  ]'::jsonb,
  3
),
(
  'care',
  'Nanny & Care Services',
  'Adult & Child Care • Companionship',
  'Background checked, CPR certified, and vaccinated staff. Dependable care for your family.',
  'Inquire for rates',
  '[
    {"label": "All Care Services", "price": "Inquire", "unit": "", "note": "Background checked, CPR certified & vaccinated staff. Rates provided on inquiry."}
  ]'::jsonb,
  4
);

-- Deals
insert into public.deals (badge, headline, detail, sort_order) values
('Every Monday',  '$20 Flat Laundry Special',                    '10 lb colored laundry with 1-week delivery. Perfect for a weekly refresh.',                         1),
('Every Wednesday','5% OFF — Nurses, Students & Expectant Mothers','Show valid ID or proof of status at time of booking. Applies to all services.',                    2),
('Sat & Sun',      '3% OFF Bulk Laundry',                         'Save on laundry orders of 100+ lbs every Saturday and Sunday.',                                    3),
('Ongoing',        'FREE Membership + 2% OFF Always',             'Sign up for free and receive 2% off all recurring services — no expiry, no catches.',              4);

-- Business hours
insert into public.business_hours (day_name, day_order, open_time, close_time, is_open) values
('Sunday',    0, null,    null,    false),
('Monday',    1, '09:00', '21:00', true),
('Tuesday',   2, '09:00', '21:00', true),
('Wednesday', 3, '09:00', '21:00', true),
('Thursday',  4, '09:00', '21:00', true),
('Friday',    5, '09:00', '21:00', true),
('Saturday',  6, '09:00', '21:00', true);

-- Contact info
insert into public.contact_info (key, label, value, href, sort_order) values
('phone',     'Call',      '202-579-2944',                          'tel:+12025792944',                              1),
('sms',       'Text',      '202-579-2944',                          'sms:+12025792944',                              2),
('whatsapp',  'WhatsApp',  '202-579-2944',                          'https://wa.me/12025792944',                     3),
('email',     'Email',     'conveniencehubofmaryland@gmail.com',    'mailto:conveniencehubofmaryland@gmail.com',     4);

-- Availability: Mon–Sat (1–6), 9 AM–8 PM hourly (last slot 20:00 = 8 PM start)
insert into public.availability (day_of_week, time_slot, is_available)
select d, t, true
from
  unnest(array[1,2,3,4,5,6]) as d,
  unnest(array['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']) as t;
