import os
import mysql.connector


class Database:
    def __init__(self):
        self.conn = mysql.connector.connect(
            host='localhost',
            port=3306,
            database='rahtipeli',
            user='pilotti',
            password='pilotti12345',
            autocommit=True,
            collation='utf8mb4_unicode_ci'
            )

    def get_conn(self):
        return self.conn