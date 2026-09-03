-- DesiHub seed data: 8 organisers, 12 venues, 30 realistic NL events across
-- every category and city. Images are intentionally left null so the branded
-- fallback-card pipeline is exercised (we never scrape organiser artwork).
-- "Now" is anchored around September 2026 so the festival season strip is live.

begin;

-- ---------------------------------------------------------------------------
-- Organisers
-- ---------------------------------------------------------------------------
insert into organisers (id, name, slug, bio, city, verified, contact_email, socials) values
  ('0a000000-0000-0000-0000-000000000001', 'Telugu Association Netherlands', 'telugu-association-nl',
   'Volunteer-run community bringing Telugu families in the Netherlands together for cultural and festival events.',
   'Amstelveen', true, 'hello@telugunl.example',
   '{"instagram":"https://instagram.com/telugunl","whatsapp_channel":"https://whatsapp.com/channel/telugunl"}'),
  ('0a000000-0000-0000-0000-000000000002', 'Gujarati Samaj Nederland', 'gujarati-samaj-nl',
   'The home of Garba, Diwali and Gujarati culture in the Randstad since 2009.',
   'Amsterdam', true, 'info@gujaratisamaj.example', '{"facebook":"https://facebook.com/gujaratisamajnl"}'),
  ('0a000000-0000-0000-0000-000000000003', 'DesiBeats Events', 'desibeats',
   'Bollywood and desi party nights across Amsterdam and Rotterdam. Big sound, bigger dancefloors.',
   'Amsterdam', true, 'book@desibeats.example',
   '{"instagram":"https://instagram.com/desibeats","website":"https://desibeats.example"}'),
  ('0a000000-0000-0000-0000-000000000004', 'Sanatan Dharm Sabha Utrecht', 'sanatan-utrecht',
   'Temple committee organising aarti, Ganesh Chaturthi and Diwali celebrations for the Utrecht community.',
   'Utrecht', false, 'seva@sanatanutrecht.example', '{}'),
  ('0a000000-0000-0000-0000-000000000005', 'Bengali Cultural Association NL', 'bengali-cultural-nl',
   'Durga Puja, Rabindra Sangeet evenings and Bengali food festivals in Den Haag.',
   'Den Haag', true, 'pujo@bengalinl.example', '{"instagram":"https://instagram.com/bengalinl"}'),
  ('0a000000-0000-0000-0000-000000000006', 'Punjabi Virsa Netherlands', 'punjabi-virsa-nl',
   'Bhangra nights, Vaisakhi and Punjabi culture across Rotterdam and beyond.',
   'Rotterdam', false, 'sat@punjabivirsa.example', '{}'),
  ('0a000000-0000-0000-0000-000000000007', 'Tamil Sangam Nederland', 'tamil-sangam-nl',
   'Tamil cultural evenings, Pongal and classical music for the Eindhoven community.',
   'Eindhoven', false, 'vanakkam@tamilsangam.example', '{}'),
  ('0a000000-0000-0000-0000-000000000008', 'Hasee Comedy Club', 'hasee-comedy',
   'The desi comedy night for the Netherlands. English and Hinglish stand-up, monthly.',
   'Amsterdam', true, 'laugh@hasee.example', '{"instagram":"https://instagram.com/haseecomedy"}');

-- ---------------------------------------------------------------------------
-- Venues
-- ---------------------------------------------------------------------------
insert into venues (id, name, address, city, lat, lng, capacity, accessibility_notes) values
  ('0b000000-0000-0000-0000-000000000001', 'Melkweg', 'Lijnbaansgracht 234a', 'Amsterdam', 52.3648, 4.8814, 1500, 'Step-free entrance; accessible toilets.'),
  ('0b000000-0000-0000-0000-000000000002', 'Paradiso', 'Weteringschans 6-8', 'Amsterdam', 52.3622, 4.8836, 1500, 'Historic building; limited step-free access, contact venue.'),
  ('0b000000-0000-0000-0000-000000000003', 'AFAS Live', 'ArenA Boulevard 590', 'Amsterdam', 52.3126, 4.9447, 6000, 'Fully wheelchair accessible; dedicated viewing platform.'),
  ('0b000000-0000-0000-0000-000000000004', 'De Meervaart', 'Meer en Vaart 300', 'Amsterdam', 52.3567, 4.8067, 1000, 'Step-free; accessible parking on site.'),
  ('0b000000-0000-0000-0000-000000000005', 'P60', 'Stationsplein 21', 'Amstelveen', 52.3021, 4.8590, 750, 'Step-free entrance and accessible toilets.'),
  ('0b000000-0000-0000-0000-000000000006', 'TivoliVredenburg', 'Vredenburgkade 11', 'Utrecht', 52.0930, 5.1155, 2000, 'Lifts to all halls; accessible throughout.'),
  ('0b000000-0000-0000-0000-000000000007', 'Rotterdam Ahoy', 'Ahoyweg 10', 'Rotterdam', 51.8858, 4.4880, 16000, 'Fully accessible arena; assistance available on request.'),
  ('0b000000-0000-0000-0000-000000000008', 'De Doelen', 'Schouwburgplein 50', 'Rotterdam', 51.9235, 4.4720, 2200, 'Step-free access and accessible seating.'),
  ('0b000000-0000-0000-0000-000000000009', 'Effenaar', 'Dommelstraat 2', 'Eindhoven', 51.4400, 5.4820, 1200, 'Accessible entrance; contact venue for seating.'),
  ('0b000000-0000-0000-0000-00000000000a', 'Zuiderstrandtheater', 'Houtrustweg 505', 'Den Haag', 52.1080, 4.2560, 1400, 'Step-free access and accessible toilets.'),
  ('0b000000-0000-0000-0000-00000000000b', 'Buurthuis De Pijp', 'Tweede van der Helststraat 66', 'Amsterdam', 52.3540, 4.8930, 300, 'Ground-floor community hall, step-free.'),
  ('0b000000-0000-0000-0000-00000000000c', 'Cultuurhuis Den Haag', 'Spui 150', 'Den Haag', 52.0767, 4.3160, 500, 'Lift access to all floors.');

-- ---------------------------------------------------------------------------
-- Events (30). Prices in integer cents. Images null -> fallback cards.
-- ---------------------------------------------------------------------------
insert into events (id, organiser_id, venue_id, title, slug, description, category, sub_category,
  starts_at, ends_at, doors_at, is_free, min_price_cents, max_price_cents, languages, age_policy,
  status, featured, family_friendly, tags) values

-- Concerts (3)
('0c000000-0000-0000-0000-000000000001','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000003',
 'Sufi Night with Kavita Seth','sufi-night-kavita-seth',
 'An evening of soulful Sufi and Bollywood classics with live orchestra. Doors 19:00, show 20:00.',
 'concert','Sufi / Bollywood','2026-10-24T18:00:00Z','2026-10-24T22:00:00Z','2026-10-24T17:00:00Z',
 false,3500,8500,'{"Hindi","Urdu"}','16+','published',true,false,'{"live music","sufi","bollywood"}'),
('0c000000-0000-0000-0000-000000000002','0a000000-0000-0000-0000-000000000006','0b000000-0000-0000-0000-000000000007',
 'Punjabi Live: Bhangra Arena','punjabi-live-bhangra-arena',
 'A high-energy Punjabi live concert with dhol, bhangra crews and a full band.',
 'concert','Punjabi','2026-11-14T19:00:00Z','2026-11-14T23:30:00Z','2026-11-14T18:00:00Z',
 false,4500,12000,'{"Punjabi","Hindi"}','All ages','published',true,false,'{"bhangra","live","arena"}'),
('0c000000-0000-0000-0000-000000000003','0a000000-0000-0000-0000-000000000007','0b000000-0000-0000-0000-000000000006',
 'Carnatic Classical Evening','carnatic-classical-evening',
 'An intimate Carnatic vocal and violin recital. Seated, all welcome.',
 'concert','Carnatic','2026-09-27T18:30:00Z','2026-09-27T21:00:00Z',null,
 false,2000,3500,'{"Tamil","Telugu"}','All ages','published',false,true,'{"classical","carnatic"}'),

-- Parties (4)
('0c000000-0000-0000-0000-000000000004','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000001',
 'Bollywood Saturdays','bollywood-saturdays-oct',
 'The monthly Bollywood and desi party. Two rooms: Bollywood classics and desi house.',
 'party','Bollywood','2026-10-10T21:00:00Z','2026-10-11T03:00:00Z','2026-10-10T21:00:00Z',
 false,1500,2500,'{"Hindi","English"}','18+','published',true,false,'{"nightlife","bollywood","dance"}'),
('0c000000-0000-0000-0000-000000000005','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000009',
 'Desi House Eindhoven','desi-house-eindhoven',
 'Desi house and Afro-desi fusion night with resident DJs.',
 'party','Desi House','2026-09-19T21:00:00Z','2026-09-20T02:00:00Z','2026-09-19T21:00:00Z',
 false,1800,1800,'{"English","Hindi"}','18+','published',false,false,'{"nightlife","house"}'),
('0c000000-0000-0000-0000-000000000006','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000008',
 'Diwali After-Party','diwali-after-party-rotterdam',
 'The official Diwali after-party. Dress to impress, festive dancefloor.',
 'party','Bollywood','2026-11-08T22:00:00Z','2026-11-09T04:00:00Z','2026-11-08T22:00:00Z',
 false,2000,3000,'{"Hindi","English"}','18+','published',true,false,'{"diwali","nightlife"}'),
('0c000000-0000-0000-0000-000000000007','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000005',
 'Retro Bollywood Night','retro-bollywood-night',
 'Golden-era Bollywood, 90s and 2000s throwbacks all night.',
 'party','Retro','2026-08-15T21:00:00Z','2026-08-16T02:00:00Z','2026-08-15T21:00:00Z',
 false,1500,2000,'{"Hindi"}','18+','published',false,false,'{"retro","throwback"}'),

-- Garba & Dandiya (3)
('0c000000-0000-0000-0000-000000000008','0a000000-0000-0000-0000-000000000002','0b000000-0000-0000-0000-000000000004',
 'Navratri Garba Night 1','navratri-garba-night-1',
 'Traditional Garba and Dandiya Raas with live dhol. Bring your sticks or buy at the door.',
 'garba_dandiya','Garba','2026-10-11T18:30:00Z','2026-10-11T23:30:00Z','2026-10-11T18:00:00Z',
 false,1200,2000,'{"Gujarati","Hindi"}','All ages','published',true,true,'{"navratri","garba","dandiya"}'),
('0c000000-0000-0000-0000-000000000009','0a000000-0000-0000-0000-000000000002','0b000000-0000-0000-0000-000000000004',
 'Navratri Garba Weekend Special','navratri-garba-weekend',
 'The big weekend Garba with a live orchestra from Gujarat and a food court.',
 'garba_dandiya','Garba','2026-10-17T18:30:00Z','2026-10-18T00:00:00Z','2026-10-17T18:00:00Z',
 false,1500,2500,'{"Gujarati","Hindi"}','All ages','published',true,true,'{"navratri","garba","live orchestra"}'),
('0c000000-0000-0000-0000-00000000000a','0a000000-0000-0000-0000-000000000007','0b000000-0000-0000-0000-000000000009',
 'Dandiya Dhamaal Eindhoven','dandiya-dhamaal-eindhoven',
 'A friendly community Dandiya night for all ages in Eindhoven.',
 'garba_dandiya','Dandiya','2026-10-18T18:00:00Z','2026-10-18T22:30:00Z','2026-10-18T17:30:00Z',
 false,1000,1500,'{"Gujarati","Hindi"}','All ages','published',false,true,'{"dandiya","community"}'),

-- Diwali (3)
('0c000000-0000-0000-0000-00000000000b','0a000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000004',
 'Diwali Gala 2026','diwali-gala-2026',
 'A grand Diwali gala: cultural performances, dinner and dancing. Family-friendly.',
 'diwali','Gala','2026-11-07T17:00:00Z','2026-11-07T23:00:00Z','2026-11-07T16:30:00Z',
 false,3000,6000,'{"Telugu","Hindi","English"}','All ages','published',true,true,'{"diwali","gala","dinner"}'),
('0c000000-0000-0000-0000-00000000000c','0a000000-0000-0000-0000-000000000004','0b000000-0000-0000-0000-00000000000b',
 'Community Diwali Mela','community-diwali-mela',
 'A free Diwali mela with diya lighting, stalls, and kids activities.',
 'diwali','Mela','2026-11-01T15:00:00Z','2026-11-01T20:00:00Z',null,
 true,0,0,'{"Hindi","English"}','All ages','published',false,true,'{"diwali","mela","free"}'),
('0c000000-0000-0000-0000-00000000000d','0a000000-0000-0000-0000-000000000005','0b000000-0000-0000-0000-00000000000a',
 'Diwali Cultural Evening','diwali-cultural-evening-denhaag',
 'Classical dance, music and a lamp-lighting ceremony to celebrate Diwali.',
 'diwali','Cultural','2026-11-06T18:00:00Z','2026-11-06T21:30:00Z',null,
 false,1500,2500,'{"Bengali","Hindi"}','All ages','published',false,true,'{"diwali","dance"}'),

-- Holi (2)
('0c000000-0000-0000-0000-00000000000e','0a000000-0000-0000-0000-000000000003','0b000000-0000-0000-0000-000000000001',
 'Holi Festival of Colours 2027','holi-festival-colours-2027',
 'The biggest Holi party with colours, water, DJs and street food. Outdoor + indoor.',
 'holi','Festival','2027-03-06T12:00:00Z','2027-03-06T18:00:00Z','2027-03-06T11:30:00Z',
 false,2000,3500,'{"Hindi","English"}','All ages','published',true,true,'{"holi","colours","festival"}'),
('0c000000-0000-0000-0000-00000000000f','0a000000-0000-0000-0000-000000000006','0b000000-0000-0000-0000-000000000008',
 'Holi Rangeela','holi-rangeela-rotterdam',
 'A family Holi celebration with organic colours and a live dhol.',
 'holi','Family','2027-03-13T11:00:00Z','2027-03-13T16:00:00Z','2027-03-13T10:30:00Z',
 false,1500,2000,'{"Hindi"}','All ages','published',false,true,'{"holi","family"}'),

-- Temple (3)
('0c000000-0000-0000-0000-000000000010','0a000000-0000-0000-0000-000000000004','0b000000-0000-0000-0000-00000000000b',
 'Ganesh Chaturthi Aarti','ganesh-chaturthi-aarti',
 'Ganesh Chaturthi celebration with aarti, bhajan and prasad. All welcome, free entry.',
 'temple','Aarti','2026-09-14T16:00:00Z','2026-09-14T19:00:00Z',null,
 true,0,0,'{"Hindi","Marathi"}','All ages','published',true,true,'{"ganesh","aarti","free"}'),
('0c000000-0000-0000-0000-000000000011','0a000000-0000-0000-0000-000000000005','0b000000-0000-0000-0000-00000000000c',
 'Durga Puja 2026','durga-puja-2026',
 'Four days of Durga Puja: pushpanjali, cultural programmes and bhog. Free entry, donations welcome.',
 'temple','Durga Puja','2026-10-09T09:00:00Z','2026-10-12T21:00:00Z',null,
 true,0,0,'{"Bengali","Hindi"}','All ages','published',true,true,'{"durga puja","bhog","free"}'),
('0c000000-0000-0000-0000-000000000012','0a000000-0000-0000-0000-000000000004','0b000000-0000-0000-0000-000000000006',
 'Diwali Lakshmi Puja','diwali-lakshmi-puja',
 'Community Lakshmi Puja on Diwali evening followed by prasad.',
 'temple','Puja','2026-11-08T17:00:00Z','2026-11-08T19:30:00Z',null,
 true,0,0,'{"Hindi"}','All ages','published',false,true,'{"diwali","puja","free"}'),

-- Cultural (3)
('0c000000-0000-0000-0000-000000000013','0a000000-0000-0000-0000-000000000005','0b000000-0000-0000-0000-00000000000c',
 'Rabindra Sangeet Evening','rabindra-sangeet-evening',
 'An evening of Tagore songs and poetry by local and guest artists.',
 'cultural','Music','2026-09-20T18:00:00Z','2026-09-20T20:30:00Z',null,
 false,1000,1500,'{"Bengali"}','All ages','published',false,true,'{"tagore","music"}'),
('0c000000-0000-0000-0000-000000000014','0a000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000005',
 'Kuchipudi & Bharatanatyam Showcase','classical-dance-showcase',
 'A showcase of South Indian classical dance by students and professionals.',
 'cultural','Dance','2026-09-26T15:00:00Z','2026-09-26T18:00:00Z',null,
 false,1200,1800,'{"Telugu","Tamil","English"}','All ages','published',false,true,'{"dance","classical"}'),
('0c000000-0000-0000-0000-000000000015','0a000000-0000-0000-0000-000000000007','0b000000-0000-0000-0000-000000000009',
 'Pongal Celebration','pongal-celebration',
 'Tamil harvest festival with traditional food, music and games.',
 'cultural','Festival','2027-01-16T11:00:00Z','2027-01-16T16:00:00Z',null,
 false,800,1200,'{"Tamil"}','All ages','published',false,true,'{"pongal","harvest"}'),

-- Comedy (2)
('0c000000-0000-0000-0000-000000000016','0a000000-0000-0000-0000-000000000008','0b000000-0000-0000-0000-00000000000b',
 'Hasee Comedy Night','hasee-comedy-night-sep',
 'Hinglish stand-up with four comedians. Sharp, relatable, desi-diaspora humour.',
 'comedy','Stand-up','2026-09-13T19:00:00Z','2026-09-13T21:30:00Z','2026-09-13T18:30:00Z',
 false,1500,2000,'{"English","Hindi"}','16+','published',true,false,'{"comedy","standup"}'),
('0c000000-0000-0000-0000-000000000017','0a000000-0000-0000-0000-000000000008','0b000000-0000-0000-0000-000000000002',
 'Desi Roast Battle','desi-roast-battle',
 'Comedians roast each other and the audience. Not for the faint-hearted.',
 'comedy','Roast','2026-10-25T20:00:00Z','2026-10-25T22:00:00Z','2026-10-25T19:30:00Z',
 false,1800,1800,'{"English"}','18+','published',false,false,'{"comedy","roast"}'),

-- Food (2)
('0c000000-0000-0000-0000-000000000018','0a000000-0000-0000-0000-000000000005','0b000000-0000-0000-0000-00000000000a',
 'Bengali Food Festival','bengali-food-festival',
 'A pop-up food festival with 20 stalls of Bengali and East Indian cuisine.',
 'food','Festival','2026-09-28T11:00:00Z','2026-09-28T18:00:00Z',null,
 false,500,500,'{"Bengali","English"}','All ages','published',false,true,'{"food","festival"}'),
('0c000000-0000-0000-0000-000000000019','0a000000-0000-0000-0000-000000000002','0b000000-0000-0000-0000-00000000000b',
 'Street Food Bazaar','desi-street-food-bazaar',
 'Chaat, dosa, biryani and mithai from home cooks and small vendors.',
 'food','Bazaar','2026-08-30T12:00:00Z','2026-08-30T19:00:00Z',null,
 true,0,0,'{"Hindi","English"}','All ages','published',false,true,'{"street food","bazaar","free"}'),

-- Family / kids (2)
('0c000000-0000-0000-0000-00000000001a','0a000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000005',
 'Kids Bollywood Dance Camp','kids-bollywood-dance-camp',
 'A weekend dance camp for kids aged 6-12. All levels, performance on the last day.',
 'family','Kids','2026-10-04T09:00:00Z','2026-10-04T13:00:00Z',null,
 false,2500,2500,'{"English","Hindi"}','6-12 yrs','published',false,true,'{"kids","dance","camp"}'),
('0c000000-0000-0000-0000-00000000001b','0a000000-0000-0000-0000-000000000004','0b000000-0000-0000-0000-00000000000b',
 'Family Storytelling: Ramayana','family-storytelling-ramayana',
 'Interactive storytelling of the Ramayana for children and parents.',
 'family','Storytelling','2026-09-21T14:00:00Z','2026-09-21T15:30:00Z',null,
 true,0,0,'{"English","Hindi"}','All ages','published',false,true,'{"kids","storytelling","free"}'),

-- Workshops (2)
('0c000000-0000-0000-0000-00000000001c','0a000000-0000-0000-0000-000000000006','0b000000-0000-0000-0000-000000000005',
 'Bhangra Dance Workshop','bhangra-dance-workshop',
 'Learn the basics of Bhangra in a fun two-hour workshop. No experience needed.',
 'workshop','Dance','2026-09-12T17:00:00Z','2026-09-12T19:00:00Z',null,
 false,1500,1500,'{"Punjabi","English"}','16+','published',false,false,'{"workshop","bhangra"}'),
('0c000000-0000-0000-0000-00000000001d','0a000000-0000-0000-0000-000000000007','0b000000-0000-0000-0000-000000000009',
 'Tabla for Beginners','tabla-for-beginners',
 'A beginner tabla workshop covering basic bols and rhythm. Instruments provided.',
 'workshop','Music','2026-10-03T13:00:00Z','2026-10-03T15:30:00Z',null,
 false,2000,2000,'{"Hindi","English"}','12+','published',false,true,'{"workshop","tabla","music"}'),

-- Networking (1)
('0c000000-0000-0000-0000-00000000001e','0a000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-00000000000c',
 'Desi Professionals Meetup','desi-professionals-meetup',
 'Networking evening for South Asian professionals in tech, finance and healthcare.',
 'networking','Professional','2026-09-25T17:30:00Z','2026-09-25T20:00:00Z',null,
 true,0,0,'{"English"}','18+','published',false,false,'{"networking","professional","free"}');

-- ---------------------------------------------------------------------------
-- Ticket types for a representative subset (drives price ranges + sold-out).
-- ---------------------------------------------------------------------------
insert into ticket_types (event_id, name, description, price_cents, fee_mode, quantity, sold, max_per_order, is_group, group_size, meal_option_required) values
  ('0c000000-0000-0000-0000-000000000001','Early bird','Limited early-bird seats',3500,'pass_on',100,100,6,false,null,false),
  ('0c000000-0000-0000-0000-000000000001','Standard','General admission',5500,'pass_on',400,120,6,false,null,false),
  ('0c000000-0000-0000-0000-000000000001','VIP','Front rows + welcome drink',8500,'pass_on',50,10,4,false,null,false),
  ('0c000000-0000-0000-0000-000000000004','Advance','Cheaper before the door',1500,'pass_on',300,180,8,false,null,false),
  ('0c000000-0000-0000-0000-000000000004','Door','On the night',2500,'pass_on',200,20,8,false,null,false),
  ('0c000000-0000-0000-0000-000000000008','Adult','Adult entry',2000,'pass_on',250,60,8,false,null,false),
  ('0c000000-0000-0000-0000-000000000008','Child (under 12)','Kids entry',1200,'pass_on',100,15,8,false,null,false),
  ('0c000000-0000-0000-0000-00000000000b','Gala seat','Includes dinner — choose your meal',6000,'pass_on',300,90,10,false,null,true),
  ('0c000000-0000-0000-0000-00000000000b','Family bundle (4)','Four gala seats',21000,'pass_on',40,8,2,true,4,true),
  ('0c000000-0000-0000-0000-000000000016','Standard','General admission',1500,'pass_on',180,180,6,false,null,false);

-- ---------------------------------------------------------------------------
-- A few subscribers + a saved-for-later demo waitlist entry.
-- ---------------------------------------------------------------------------
insert into subscribers (email, city, interests) values
  ('priya@example.nl','Amsterdam','{"party","concert","holi"}'),
  ('arjun@example.nl','Utrecht','{"temple","family","diwali"}'),
  ('meera@example.nl','Den Haag','{"cultural","food"}');

insert into waitlist (event_id, email) values
  ('0c000000-0000-0000-0000-000000000016','fan@example.nl');

commit;
