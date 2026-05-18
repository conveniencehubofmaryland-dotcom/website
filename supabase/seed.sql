-- ============================================================
-- Convenience Hub of Maryland — Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- Services
insert into public.services (slug, title, subtitle, description, price_from, pricing_details, sort_order) values
(
  'laundry',
  'Premium Laundry Pickup & Delivery',
  'We Pickup • Wash • Dry • Fold • Deliver',
  'Regular 1–3 day turnaround or same-day express. Colors, bedding, and whites. Minimum 10 lbs. Mon–Sat 9 AM–9 PM.',
  'From $3.99/lb',
  '[
    {"section":"Regular Service (1–3 Day Delivery)","label":"Colors","price":"$3.99","unit":"/lb"},
    {"section":"Regular Service (1–3 Day Delivery)","label":"Bedding & Linens","price":"$4.99","unit":"/lb"},
    {"section":"Regular Service (1–3 Day Delivery)","label":"Whites","price":"$6.99","unit":"/lb"},
    {"section":"Same Day Express Delivery","label":"Colors","price":"$5.99","unit":"/lb"},
    {"section":"Same Day Express Delivery","label":"Bedding & Linens","price":"$6.99","unit":"/lb"},
    {"section":"Same Day Express Delivery","label":"Whites","price":"$8.99","unit":"/lb"}
  ]'::jsonb,
  1
),
(
  'cleaning',
  'Professional Cleaning & Estate Care',
  'Residential • Commercial • Move-In/Move-Out',
  'Market-adjusted pricing for Virginia (NOVA), Maryland, and D.C. communities. Standard maintenance, deep cleaning, move-in/out turnovers, and hourly shifts.',
  'From $100/visit',
  '[
    {"section":"Standard Residential Cleaning","label":"Studio Apartment","price":"$100–$150","unit":"/visit"},
    {"section":"Standard Residential Cleaning","label":"1 Bed / 1 Bath","price":"$130–$200","unit":"/visit"},
    {"section":"Standard Residential Cleaning","label":"2 Bed / 2 Bath","price":"$200–$250","unit":"/visit"},
    {"section":"Standard Residential Cleaning","label":"3 Bed / 2 Bath","price":"$250–$350","unit":"/visit"},
    {"section":"Standard Residential Cleaning","label":"4+ Bed / Estate Scale","price":"$350–$450+","unit":"/visit"},
    {"section":"Deep Cleaning","label":"Deep Clean Add-On","price":"+$60–$110","unit":"","note":"Added to standard baseline rate"},
    {"section":"Deep Cleaning","label":"Full One-Time Deep Clean","price":"$250–$450","unit":"","note":"Based on sq. footage & initial condition"},
    {"section":"Move-In / Move-Out Cleaning","label":"1 Bedroom","price":"$150–$250","unit":"/visit"},
    {"section":"Move-In / Move-Out Cleaning","label":"2 Bedroom","price":"$250–$350","unit":"/visit"},
    {"section":"Move-In / Move-Out Cleaning","label":"3 Bedroom","price":"$350–$450","unit":"/visit"},
    {"section":"Move-In / Move-Out Cleaning","label":"4+ Bed / Luxury","price":"$380–$500+","unit":"/visit"},
    {"section":"Hourly & Recurring","label":"Individual Shift (≤ 4 hrs)","price":"$54.99","unit":"/hr"},
    {"section":"Hourly & Recurring","label":"Individual Shift (5+ hrs)","price":"$49.99","unit":"/hr"},
    {"section":"Hourly & Recurring","label":"Weekly / Bi-weekly / Monthly","price":"Discounted","unit":"","note":"Contact us for a custom plan"},
    {"section":"Hourly & Recurring","label":"Executive Residency Plan","price":"Custom Quote","unit":"","note":"5-day/week dedicated staff"},
    {"section":"À La Carte Add-Ons","label":"Inside Oven / Grill","price":"$25–$45"},
    {"section":"À La Carte Add-Ons","label":"Inside Refrigerator / Freezer","price":"$25–$45"},
    {"section":"À La Carte Add-Ons","label":"Interior Windows & Tracks","price":"$35–$80"},
    {"section":"À La Carte Add-Ons","label":"Heavy Pet Hair Removal","price":"$20–$55"},
    {"section":"À La Carte Add-Ons","label":"Post-Event / Heavy Condition","price":"$40–$90"}
  ]'::jsonb,
  2
),
(
  'culinary',
  'Culinary, Housekeeping & Household Management',
  '6-Hour Minimum',
  'Complete estate support: light cooking, custom meal prep, tidying, daily laundry, errand running, and deep organizational overhauls. Final rate negotiable based on estate square footage and task requirements.',
  'From $50/hr',
  '[
    {"label":"Custom Hourly Rate","price":"$50–$60","unit":"/hr","note":"6-hour minimum. Negotiable based on estate size & tasks"},
    {"label":"5-Day Specialized Support","price":"Custom Quote","unit":"","note":"Dedicated staff for total household ownership & daily continuity"},
    {"label":"Errands & Concierge","price":"$0.725","unit":"/mile","note":"Shopping, grocery runs & appointment management"}
  ]'::jsonb,
  3
),
(
  'care',
  'Premium Nanny & Housekeeping Services',
  'Adult & Child Care • Companionship',
  'Comprehensive childcare, companionship, and integrated household support. Customized placement packages tailored to family schedules and specialized care needs. All personnel strictly vetted.',
  'Inquire for rates',
  '[
    {"label":"Customized Care Packages","price":"Custom Quote","unit":"","note":"Tailored to family schedules, routines, and specialized child or adult care needs"}
  ]'::jsonb,
  4
),
(
  'commercial',
  'Commercial Operations & Special Projects',
  'Offices • Retail • Warehouses • Post-Construction',
  'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects custom-quoted per project scope. Commercial models typically operate within a 60%–80% project value structure.',
  'Custom Quote',
  '[
    {"label":"Corporate Offices & Retail","price":"Custom Quote","unit":"","note":"Quoted per project scope"},
    {"label":"Warehouses & Post-Construction","price":"Custom Quote","unit":"","note":"60%–80% project value structure"}
  ]'::jsonb,
  5
);

-- Deals
insert into public.deals (badge, headline, detail, sort_order) values
('Every Monday',    '$20 Flat Laundry Special',                         '$20 flat rate for 10 lbs of colored laundry — economy 1-week turnaround delivery.',                   1),
('Every Wednesday', '5% OFF — Healthcare, Students & Expectant Mothers', '5% OFF all premium services for healthcare workers/nurses, active students, and expectant mothers.',   2),
('Sat & Sun',       '3% OFF Bulk Laundry Orders',                        'Save 3% on laundry orders of 100+ lbs every Saturday and Sunday.',                                    3),
('Ongoing',         'FREE Membership + 2% OFF Always',                   'Free network signup + 2% locked-in discount on all recurring monthly contracts. No expiry, no catches.', 4);

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
