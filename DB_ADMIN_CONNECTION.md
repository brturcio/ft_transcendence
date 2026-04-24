# PostgreSQL Admin - Connection Info and Methods

## Admin account
- Username: admin
- Password: admin
- Host: 127.0.0.1
- Port: 5432
- Database: ft_transcendence

## Connection URLs
- App URL (with schema): postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?schema=public&sslmode=disable
- psql URL (without schema): postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?sslmode=disable

## Start and check server
pg_ctlcluster 16 main start
pg_lsclusters
pg_isready -h 127.0.0.1 -p 5432 -U admin

## Connect with psql (interactive)
psql "postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?sslmode=disable"

## Test connection (one-liner)
psql "postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?sslmode=disable" -tAc "SELECT current_user, current_database();"

## Backend env values
In back/.env and back/.env.example:
DATABASE_URL=postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?schema=public&sslmode=disable

## Useful admin checks
- List tables:
psql "postgresql://admin:admin@127.0.0.1:5432/ft_transcendence?sslmode=disable" -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

- Check DB owner:
su - postgres -c "psql -d postgres -tAc \"SELECT datname, pg_catalog.pg_get_userbyid(datdba) FROM pg_database WHERE datname='ft_transcendence';\""

- Verify admin privileges on database:
su - postgres -c "psql -d ft_transcendence -tAc \"SELECT has_database_privilege('admin','ft_transcendence','CREATE,CONNECT,TEMP');\""
