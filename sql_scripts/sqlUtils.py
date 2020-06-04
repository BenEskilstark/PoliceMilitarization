import sqlite3
from sqlite3 import Error

class SqlDB(object):

    def __init__(self, db_name='./testdb'):
        self.conn = sqlite3.connect(db_name)

    # sql e.g. 'INSERT INTO table (a, b, c) VALUES (?, ?, ?);'
    # args is array of values if needed
    def exec(self, sql, args=[]):
        cursor = self.conn.cursor()
        try:
            cursor.execute(sql, args)
            self.conn.commit()
        except Error as e:
            print(e)


class SqlTable(object):

    # columns: dict of col name --> string type, etc.
    def __init__(self, table_name, columns, db='./testdb'):
        self.table_name = table_name
        self.columns = columns
        self.db = SqlDB(db)
        self.db.exec(self.get_create_statement())

    def insert(self, sql_row):
        self.db.exec(sql_row.get_insert_statement())

    def get_create_statement(self):
        cols = ''
        for k in self.columns.keys():
            cols += str(k) + ' ' + str(self.columns[k]) + ', '
        cols = cols[:-2]

        create = 'CREATE TABLE IF NOT EXISTS {} ({});'
        return create.format(self.table_name, cols)


class SqlRow(object):

    # columns: dict of col name --> col value
    def __init__(self, table_name, columns):
        self.columns = {}
        self.table_name = table_name
        self.add_columns(columns)

    def add_columns(self, cols):
        for k in cols.keys():
            self.columns[k] = cols[k]

    def set_columns(self, cols):
        self.columns = {}
        self.add_columns(cols)

    def copy(self):
        return SqlRow(self.table_name, self.columns)

    # if update=True then it will insert OR update existing row
    def get_insert_statement(self, update=False):
        cols = '('
        vals = '('
        for k in self.columns.keys():
            cols += str(k) + ', '
            val = self.columns[k]
            if isinstance(val, str):
                val = '"' + str(val) + '"'
            vals += str(val) + ', '
        cols = cols[:-2] + ')'
        vals = vals[:-2] + ')'

        insert = 'INSERT INTO {} {} VALUES {};'
        if update:
            insert = 'INSERT OR REPLACE INTO {} {} VALUES {};'
        return insert.format(self.table_name, cols, vals)

