-- Comprehensive Migration Verification Report
-- This script verifies all migrations executed successfully

SELECT '=== MIGRATION VERIFICATION REPORT ===' as report;
SELECT '';
SELECT '1. TABLE VERIFICATION' as section;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT '';
SELECT '2. SEED DATA VERIFICATION' as section;
SELECT 'Locations' as entity, COUNT(*) as count FROM locations
UNION ALL
SELECT 'Citizens', COUNT(*) FROM citizens
UNION ALL
SELECT 'Leaders', COUNT(*) FROM leaders
UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'Service Departments', COUNT(*) FROM service_departments
UNION ALL
SELECT 'Service Requests', COUNT(*) FROM service_requests
UNION ALL
SELECT 'Visitor Registrations', COUNT(*) FROM visitor_registrations;
SELECT '';
SELECT '3. HIERARCHY VERIFICATION' as section;
SELECT 'Level 1 (Provinces)' as level_name, COUNT(*) as count FROM locations WHERE level = 1
UNION ALL
SELECT 'Level 2 (Districts)', COUNT(*) FROM locations WHERE level = 2
UNION ALL
SELECT 'Level 3 (Sectors)', COUNT(*) FROM locations WHERE level = 3
UNION ALL
SELECT 'Level 4 (Cells)', COUNT(*) FROM locations WHERE level = 4
UNION ALL
SELECT 'Level 5 (Villages)', COUNT(*) FROM locations WHERE level = 5;
SELECT '';
SELECT '4. FOREIGN KEY CONSTRAINTS' as section;
SELECT 'All citizens have valid home_location_id' as check_name, 
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM citizens WHERE home_location_id NOT IN (SELECT id FROM locations);
SELECT '';
SELECT '5. INDEXES VERIFICATION' as section;
SELECT COUNT(*) as total_indexes FROM information_schema.statistics WHERE table_schema = 'public';
SELECT '';
SELECT '6. TRIGGERS VERIFICATION' as section;
SELECT COUNT(*) as total_triggers FROM information_schema.triggers WHERE trigger_schema = 'public';
