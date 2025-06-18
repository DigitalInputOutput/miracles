from django.core.management.base import BaseCommand
from shop.models import Setup
import pymysql
from system.settings import DATABASES
import os
import glob
from system.settings import BASE_DIR
from django.core.management import call_command

import getpass

database_name = DATABASES.get('default').get('NAME')
database_user = DATABASES.get('default').get('USER')
database_pass = DATABASES.get('default').get('PASSWORD')
database_host = DATABASES.get('default').get('HOST')

class Command(BaseCommand):
    help = 'Create Static'

    def handle(self, *args, **options):
        answer = input("This will delete database. Are you sure? [y/N] ")

        if answer == "y":

            answer = input("Recreate database? [y/N] ")

            if answer == "y":
                password = getpass.getpass("Enter root password for database server: ")
                # Connect to MySQL (without specifying a database)
                connection = pymysql.connect(
                    host="localhost",
                    user="root",
                    password=password
                )

                try:
                    # Create a cursor object
                    with connection.cursor() as cursor:

                        set_fgk = "SET FOREIGN_KEY_CHECKS = 0;"
                        cursor.execute(set_fgk)

                        # Drop the database if it exists
                        drop_db_query = f"DROP DATABASE IF EXISTS {database_name};"
                        cursor.execute(drop_db_query)
                        print(f"Database '{database_name}' dropped.")
                        
                        # Recreate the database
                        create_db_query = f"CREATE DATABASE {database_name} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;"
                        cursor.execute(create_db_query)
                        print(f"Database '{database_name}' created.")
                        
                        #Add user
                        create_user_query = f"CREATE USER IF NOT EXISTS '{database_user}'@'{database_host}' IDENTIFIED BY '{database_pass}';"
                        cursor.execute(create_user_query)
                        print(f"User created {database_user}")

                        # Add permissions
                        use_db_query = f"GRANT ALL ON {database_name}.* TO '{database_user}'@'{database_host}';"
                        cursor.execute(use_db_query)
                        print(f"Switched to database '{database_name}'.")

                        set_fgk = "SET FOREIGN_KEY_CHECKS = 1;"
                        cursor.execute(set_fgk)

                    # Commit any changes if needed (though not necessary for CREATE/DROP)
                    connection.commit()

                finally:
                    # Close the connection
                    connection.close()

                print("Database created.")

            answer = input("Recreate migrations? [y/N] ")

            if answer == "y":
                project_dir = BASE_DIR.parent.parent

                for d in [project_dir / 'manager/server', project_dir / 'shop/server']:

                    # Iterate over all apps and remove migration files
                    for app in os.listdir(d):
                        migrations_dir = os.path.join(d, app, 'migrations')

                        if os.path.isdir(migrations_dir):
                            # Find all migration files except __init__.py
                            migration_files = glob.glob(os.path.join(migrations_dir, '*.py'))
                            migration_files = [f for f in migration_files if not f.endswith('__init__.py')]

                            # Delete migration files
                            for migration_file in migration_files:
                                print(f"Removing {migration_file}")
                                os.remove(migration_file)

                call_command("makemigrations", "shop")
                call_command("makemigrations", "user")
                call_command("makemigrations", "catalog")
                call_command("makemigrations", "checkout")
                call_command("makemigrations", "manager")

                call_command("migrate")

                print("Migration complete.")

                call_command("install")