import os

# Database
DB_CONFIG = {
    'user': os.getenv('APP_DB_USER'),
    'pass': os.getenv('APP_DB_PASS'),
    'host': os.getenv('APP_DB_HOST'),
    'port': os.getenv('APP_DB_PORT', 5432),
    'database': os.getenv('APP_DB_NAME')
}
