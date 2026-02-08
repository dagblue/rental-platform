-- Ensure rental user has password
ALTER USER rental WITH PASSWORD 'rental123';

-- Create app_user for Prisma
CREATE USER app_user WITH PASSWORD 'app_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rental_platform TO rental, app_user;

-- Connect to database and grant schema permissions
\c rental_platform;

GRANT ALL PRIVILEGES ON SCHEMA public TO rental, app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rental, app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rental, app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rental, app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rental, app_user;
