-- Seed data migration with realistic Rwandan information
-- This migration populates the database with test data for development and testing
-- Uses fixed UUIDs (hardcoded, not generated) for all locations to ensure consistent foreign key relationships across runs

-- ============================================================================
-- LOCATIONS: Rwanda's 5-level administrative hierarchy
-- ============================================================================

-- Level 1: Provinces (2)
INSERT INTO locations (id, name, name_kinyarwanda, level, parent_id, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'Kigali City', 'Umujyi wa Kigali', 1, NULL, -1.9536, 29.8739),
('22222222-2222-2222-2222-222222222222', 'Southern Province', 'Intara y''Amajyaruguru', 1, NULL, -2.5833, 29.7333);

-- Level 2: Districts (2)
INSERT INTO locations (id, name, name_kinyarwanda, level, parent_id, latitude, longitude) VALUES
('33333333-3333-3333-3333-333333333333', 'Gasabo', 'Gasabo', 2, '11111111-1111-1111-1111-111111111111', -1.9500, 30.0667),
('44444444-4444-4444-4444-444444444444', 'Muhanga', 'Muhanga', 2, '22222222-2222-2222-2222-222222222222', -2.0167, 30.0167);

-- Level 3: Sectors (4)
INSERT INTO locations (id, name, name_kinyarwanda, level, parent_id, latitude, longitude) VALUES
('55555555-5555-5555-5555-555555555555', 'Ndera', 'Ndera', 3, '33333333-3333-3333-3333-333333333333', -1.9333, 30.0833),
('66666666-6666-6666-6666-666666666666', 'Kacyiru', 'Kacyiru', 3, '33333333-3333-3333-3333-333333333333', -1.9667, 30.0500),
('77777777-7777-7777-7777-777777777777', 'Mushishiro', 'Mushishiro', 3, '44444444-4444-4444-4444-444444444444', -2.0333, 30.0333),
('88888888-8888-8888-8888-888888888888', 'Shyogwe', 'Shyogwe', 3, '44444444-4444-4444-4444-444444444444', -2.0500, 30.0000);

-- Level 4: Cells (8 - 2 per sector)
INSERT INTO locations (id, name, name_kinyarwanda, level, parent_id, latitude, longitude) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ndera Cell A', 'Ndera Cell A', 4, '55555555-5555-5555-5555-555555555555', -1.9300, 30.0850),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ndera Cell B', 'Ndera Cell B', 4, '55555555-5555-5555-5555-555555555555', -1.9350, 30.0800),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kacyiru Cell A', 'Kacyiru Cell A', 4, '66666666-6666-6666-6666-666666666666', -1.9650, 30.0550),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Kacyiru Cell B', 'Kacyiru Cell B', 4, '66666666-6666-6666-6666-666666666666', -1.9700, 30.0450),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mushishiro Cell A', 'Mushishiro Cell A', 4, '77777777-7777-7777-7777-777777777777', -2.0300, 30.0350),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mushishiro Cell B', 'Mushishiro Cell B', 4, '77777777-7777-7777-7777-777777777777', -2.0350, 30.0300),
('11111111-2222-3333-4444-555555555555', 'Shyogwe Cell A', 'Shyogwe Cell A', 4, '88888888-8888-8888-8888-888888888888', -2.0500, 30.0050),
('22222222-3333-4444-5555-666666666666', 'Shyogwe Cell B', 'Shyogwe Cell B', 4, '88888888-8888-8888-8888-888888888888', -2.0550, 29.9950);

-- Level 5: Villages (16 - 2 per cell)
INSERT INTO locations (id, name, name_kinyarwanda, level, parent_id, latitude, longitude) VALUES
('33333333-4444-5555-6666-777777777777', 'Ndera Village 1', 'Ndera Village 1', 5, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -1.9290, 30.0860),
('44444444-5555-6666-7777-888888888888', 'Ndera Village 2', 'Ndera Village 2', 5, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -1.9310, 30.0840),
('55555555-6666-7777-8888-999999999999', 'Ndera Village 3', 'Ndera Village 3', 5, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -1.9340, 30.0810),
('66666666-7777-8888-9999-aaaaaaaaaaaa', 'Ndera Village 4', 'Ndera Village 4', 5, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -1.9360, 30.0790),
('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'Kacyiru Village 1', 'Kacyiru Village 1', 5, 'cccccccc-cccc-cccc-cccc-cccccccccccc', -1.9640, 30.0560),
('88888888-9999-aaaa-bbbb-cccccccccccc', 'Kacyiru Village 2', 'Kacyiru Village 2', 5, 'cccccccc-cccc-cccc-cccc-cccccccccccc', -1.9660, 30.0540),
('99999999-aaaa-bbbb-cccc-dddddddddddd', 'Kacyiru Village 3', 'Kacyiru Village 3', 5, 'dddddddd-dddd-dddd-dddd-dddddddddddd', -1.9690, 30.0460),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Kacyiru Village 4', 'Kacyiru Village 4', 5, 'dddddddd-dddd-dddd-dddd-dddddddddddd', -1.9710, 30.0440),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Mushishiro Village 1', 'Mushishiro Village 1', 5, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', -2.0290, 30.0360),
('cccccccc-dddd-eeee-ffff-111111111111', 'Mushishiro Village 2', 'Mushishiro Village 2', 5, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', -2.0310, 30.0340),
('dddddddd-eeee-ffff-1111-222222222222', 'Mushishiro Village 3', 'Mushishiro Village 3', 5, 'ffffffff-ffff-ffff-ffff-ffffffffffff', -2.0340, 30.0310),
('eeeeeeee-ffff-1111-2222-333333333333', 'Mushishiro Village 4', 'Mushishiro Village 4', 5, 'ffffffff-ffff-ffff-ffff-ffffffffffff', -2.0360, 30.0290),
('ffffffff-1111-2222-3333-444444444444', 'Shyogwe Village 1', 'Shyogwe Village 1', 5, '11111111-2222-3333-4444-555555555555', -2.0490, 30.0060),
('11111111-2222-3333-4444-555555555556', 'Shyogwe Village 2', 'Shyogwe Village 2', 5, '11111111-2222-3333-4444-555555555555', -2.0510, 30.0040),
('22222222-3333-4444-5555-666666666667', 'Shyogwe Village 3', 'Shyogwe Village 3', 5, '22222222-3333-4444-5555-666666666666', -2.0540, 29.9960),
('33333333-4444-5555-6666-777777777778', 'Shyogwe Village 4', 'Shyogwe Village 4', 5, '22222222-3333-4444-5555-666666666666', -2.0560, 29.9940);

-- ============================================================================
-- CITIZENS: 20 citizens with realistic Rwandan names
-- ============================================================================

INSERT INTO citizens (id, national_id, first_name, last_name, phone_number, date_of_birth, gender, home_location_id, is_leader, is_active) VALUES
('c0000001-0000-0000-0000-000000000001', '1123456789012345678', 'Jean', 'Habimana', '+250788123456', '1975-03-15', 'M', '33333333-3333-3333-3333-333333333333', TRUE, TRUE),
('c0000002-0000-0000-0000-000000000002', '1234567890123456789', 'Marie', 'Uwimana', '+250789234567', '1980-07-22', 'F', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TRUE, TRUE),
('c0000003-0000-0000-0000-000000000003', '1345678901234567890', 'Pierre', 'Nkurunziza', '+250787345678', '1978-11-08', 'M', 'cccccccc-cccc-cccc-cccc-cccccccccccc', TRUE, TRUE),
('c0000004-0000-0000-0000-000000000004', '1456789012345678901', 'Francine', 'Mukamana', '+250786456789', '1982-05-30', 'F', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', TRUE, TRUE),
('c0000005-0000-0000-0000-000000000005', '1567890123456789012', 'David', 'Kamanzi', '+250785567890', '1976-09-12', 'M', '44444444-4444-4444-4444-444444444444', TRUE, TRUE),
('c0000006-0000-0000-0000-000000000006', '1678901234567890123', 'Beatrice', 'Nyirahabimana', '+250784678901', '1985-01-25', 'F', '33333333-3333-3333-3333-333333333333', FALSE, TRUE),
('c0000007-0000-0000-0000-000000000007', '1789012345678901234', 'Emmanuel', 'Rurangwa', '+250783789012', '1988-04-18', 'M', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', FALSE, TRUE),
('c0000008-0000-0000-0000-000000000008', '1890123456789012345', 'Sylvie', 'Mukamusoni', '+250782890123', '1986-08-09', 'F', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', FALSE, TRUE),
('c0000009-0000-0000-0000-000000000009', '1901234567890123456', 'Innocent', 'Niyibizi', '+250781901234', '1984-12-03', 'M', 'cccccccc-cccc-cccc-cccc-cccccccccccc', FALSE, TRUE),
('c0000010-0000-0000-0000-000000000010', '1012345678901234567', 'Josephine', 'Mukankusi', '+250780012345', '1987-06-14', 'F', 'dddddddd-dddd-dddd-dddd-dddddddddddd', FALSE, TRUE),
('c0000011-0000-0000-0000-000000000011', '1123456789012345679', 'Clement', 'Habiyaremye', '+250779123456', '1983-10-27', 'M', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', FALSE, TRUE),
('c0000012-0000-0000-0000-000000000012', '1234567890123456780', 'Therese', 'Nyirahabimana', '+250778234567', '1989-02-11', 'F', 'ffffffff-ffff-ffff-ffff-ffffffffffff', FALSE, TRUE),
('c0000013-0000-0000-0000-000000000013', '1345678901234567891', 'Gideon', 'Nkurunziza', '+250777345678', '1981-07-19', 'M', '11111111-2222-3333-4444-555555555555', FALSE, TRUE),
('c0000014-0000-0000-0000-000000000014', '1456789012345678902', 'Diane', 'Mukamana', '+250776456789', '1990-03-05', 'F', '22222222-3333-4444-5555-666666666666', FALSE, TRUE),
('c0000015-0000-0000-0000-000000000015', '1567890123456789013', 'Raphael', 'Kamanzi', '+250775567890', '1985-09-22', 'M', '33333333-4444-5555-6666-777777777777', FALSE, TRUE),
('c0000016-0000-0000-0000-000000000016', '1678901234567890124', 'Chantal', 'Uwimana', '+250774678901', '1988-11-30', 'F', '44444444-5555-6666-7777-888888888888', FALSE, TRUE),
('c0000017-0000-0000-0000-000000000017', '1789012345678901235', 'Olivier', 'Niyibizi', '+250773789012', '1982-05-08', 'M', '55555555-6666-7777-8888-999999999999', FALSE, TRUE),
('c0000018-0000-0000-0000-000000000018', '1890123456789012346', 'Veronique', 'Mukankusi', '+250772890123', '1986-12-16', 'F', '66666666-7777-8888-9999-aaaaaaaaaaaa', FALSE, TRUE),
('c0000019-0000-0000-0000-000000000019', '1901234567890123457', 'Serge', 'Habiyaremye', '+250771901234', '1984-04-24', 'M', '77777777-8888-9999-aaaa-bbbbbbbbbbbb', FALSE, TRUE),
('c0000020-0000-0000-0000-000000000020', '1012345678901234568', 'Monique', 'Nyirahabimana', '+250770012345', '1987-08-07', 'F', '88888888-9999-aaaa-bbbb-cccccccccccc', FALSE, TRUE);

-- ============================================================================
-- LEADERS: 5 leaders with titles covering different administrative levels
-- ============================================================================

INSERT INTO leaders (id, citizen_id, location_id, title, phone_number, email, office_address, office_latitude, office_longitude, is_active, appointed_at) VALUES
('10000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'District Mayor', '+250788123456', 'jean.habimana@gasabo.gov.rw', 'Gasabo District Office, Kigali', -1.9500, 30.0667, TRUE, '2022-01-15'),
('10000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cell Coordinator', '+250789234567', 'marie.uwimana@ndera.gov.rw', 'Ndera Cell Office, Kigali', -1.9300, 30.0850, TRUE, '2022-06-20'),
('10000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sector Executive Secretary', '+250787345678', 'pierre.nkurunziza@kacyiru.gov.rw', 'Kacyiru Sector Office, Kigali', -1.9650, 30.0550, TRUE, '2022-03-10'),
('10000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sector Executive Secretary', '+250786456789', 'francine.mukamana@mushishiro.gov.rw', 'Mushishiro Sector Office, Muhanga', -2.0300, 30.0350, TRUE, '2022-04-05'),
('10000005-0000-0000-0000-000000000005', 'c0000005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'District Mayor', '+250785567890', 'david.kamanzi@muhanga.gov.rw', 'Muhanga District Office, Muhanga', -2.0167, 30.0167, TRUE, '2022-02-28');

-- ============================================================================
-- SERVICE DEPARTMENTS: 8 realistic Rwandan government agencies
-- ============================================================================

INSERT INTO service_departments (id, name, name_kinyarwanda, description, category, phone_number, email, website_url, is_active) VALUES
('20000001-0000-0000-0000-000000000001', 'Rwanda National Police', 'Polisi Nzira y''u Rwanda', 'National police force responsible for law enforcement and public safety', 'security', '+250788111111', 'info@police.gov.rw', 'https://www.police.gov.rw', TRUE),
('20000002-0000-0000-0000-000000000002', 'Rwanda Energy Group', 'Ikundi ry''Ingufu z''u Rwanda', 'National electricity utility providing power distribution', 'utilities', '+250788222222', 'customer@reg.rw', 'https://www.reg.rw', TRUE),
('20000003-0000-0000-0000-000000000003', 'WASAC', 'WASAC', 'Water and Sanitation Corporation providing water services', 'utilities', '+250788333333', 'info@wasac.rw', 'https://www.wasac.rw', TRUE),
('20000004-0000-0000-0000-000000000004', 'Rwanda Revenue Authority', 'Ikindi ry''Inyungu z''u Rwanda', 'Tax authority responsible for revenue collection', 'finance', '+250788444444', 'info@rra.gov.rw', 'https://www.rra.gov.rw', TRUE),
('20000005-0000-0000-0000-000000000005', 'RURA', 'RURA', 'Utilities Regulatory Authority overseeing utilities sector', 'utilities', '+250788555555', 'info@rura.rw', 'https://www.rura.rw', TRUE),
('20000006-0000-0000-0000-000000000006', 'MINALOC', 'MINALOC', 'Ministry of Local Government responsible for local administration', 'general', '+250788666666', 'info@minaloc.gov.rw', 'https://www.minaloc.gov.rw', TRUE),
('20000007-0000-0000-0000-000000000007', 'Rwanda Biomedical Centre', 'Ikindi ry''Ubuvuzi bw''u Rwanda', 'National laboratory and biomedical research center', 'health', '+250788777777', 'info@rbc.gov.rw', 'https://www.rbc.gov.rw', TRUE),
('20000008-0000-0000-0000-000000000008', 'MINISANTE', 'MINISANTE', 'Ministry of Health responsible for healthcare services', 'health', '+250788888888', 'info@minisante.gov.rw', 'https://www.minisante.gov.rw', TRUE);

-- ============================================================================
-- ANNOUNCEMENTS: 12 announcements across all categories
-- ============================================================================

INSERT INTO announcements (id, leader_id, location_id, title, body, category, is_urgent, scheduled_at, expires_at) VALUES
('30000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Community Development Project', 'The Gasabo District is launching a new community development project to improve local infrastructure. All residents are encouraged to participate.', 'general', FALSE, NULL, NULL),
('30000002-0000-0000-0000-000000000002', '10000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Water Supply Maintenance', 'Water supply maintenance will be conducted on Saturday from 8 AM to 4 PM. Please store water in advance.', 'general', FALSE, NULL, '2026-02-28 23:59:59+00'),
('30000003-0000-0000-0000-000000000003', '10000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Community Meeting - Health Services', 'Important community meeting to discuss health services improvement. Meeting scheduled for next Wednesday at 2 PM at the Sector Office.', 'meeting', FALSE, '2026-02-18 14:00:00+00', NULL),
('30000004-0000-0000-0000-000000000004', '10000004-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sector Leaders Meeting', 'All sector leaders are required to attend the monthly coordination meeting on Friday at 10 AM.', 'meeting', TRUE, '2026-02-20 10:00:00+00', NULL),
('30000005-0000-0000-0000-000000000005', '10000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Road Rehabilitation Project', 'The main road in Gasabo District will be rehabilitated starting next month. Expect temporary traffic disruptions.', 'infrastructure', FALSE, NULL, '2026-03-31 23:59:59+00'),
('30000006-0000-0000-0000-000000000006', '10000005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'School Construction Update', 'The new primary school construction in Muhanga is 75% complete. Expected completion by end of March.', 'infrastructure', FALSE, NULL, NULL),
('30000007-0000-0000-0000-000000000007', '10000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vaccination Campaign', 'Free vaccination campaign for children under 5 years. Dates: February 15-17 at the Health Center.', 'health', FALSE, '2026-02-15 08:00:00+00', '2026-02-17 17:00:00+00'),
('30000008-0000-0000-0000-000000000008', '10000003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Malaria Prevention Awareness', 'Important information about malaria prevention. Use mosquito nets and maintain clean surroundings.', 'health', FALSE, NULL, NULL),
('30000009-0000-0000-0000-000000000009', '10000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Security Alert - Theft Prevention', 'Recent thefts reported in the area. Residents are advised to secure their homes and report suspicious activities.', 'security', TRUE, NULL, NULL),
('30000010-0000-0000-0000-000000000010', '10000004-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Traffic Safety Reminder', 'Reminder to all drivers to follow traffic rules and speed limits. Safety is everyone''s responsibility.', 'security', FALSE, NULL, NULL),
('30000011-0000-0000-0000-000000000011', '10000005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'Umuganda - Community Service Day', 'This month''s Umuganda (community service day) will focus on environmental cleanup and tree planting. All residents are encouraged to participate.', 'umuganda', FALSE, '2026-02-22 06:00:00+00', '2026-02-22 18:00:00+00'),
('30000012-0000-0000-0000-000000000012', '10000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'EMERGENCY: Heavy Rainfall Warning', 'Heavy rainfall is expected in the coming days. Residents in flood-prone areas should take precautions and move to safer locations if necessary.', 'emergency', TRUE, NULL, '2026-02-20 23:59:59+00');
