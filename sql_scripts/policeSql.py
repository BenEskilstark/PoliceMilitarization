import csv
from sqlUtils import SqlTable, SqlRow

'''
    In the data, many acquisitions are for the exact same items
    and acquired on the same dates for the same police departments
    but inexplicably separated out into different rows.
    e.g. California's Alameda County Sheriff Office bought many
    rifles at a time, but there is one row in the data for each
    rifle instead of simply combining those rows and setting the
    total value in the "quantity" column like for other acquisitions.

    This table does not do any combining of overly-vertical data like
    above, but is just a sql verion of the csv.

'''
class PoliceRawTable(object):
    def __init__(self):
        columns = {
            'id': 'integer PRIMARY KEY AUTOINCREMENT',

            # location information
            'state': 'text',
            'station_name': 'text',
            'station_type': 'text',

            # government identifiers
            'nsn': 'text',
            'demil_code': 'text',
            'demil_ic' : 'text',

            # the stuff
            'item_name': 'text',
            'quantity': 'integer',
            'ui': 'text', # not sure what this stands for,
                          # indicates what the quantity value is
                          # refering to, e.g. 'Each', 'Box', 'Dozen'
            'acquisition_value': 'text',
            'ship_date': 'text',
        }
        self.table_name = 'police'
        self.table = SqlTable(self.table_name, columns)

    # all the csv file names are compiled together in the given file
    # then loop through each and insert their data into the table
    def insert_all_state_data(self, files_list='stateFileNames.txt'):
        f = open(files_list, 'r')
        for file_name in f:
            print('inserting data from ' + file_name.strip())
            self.insert_by_state(file_name.strip())
        f.close()


    # each state/territory is a different csv. This function
    # will load one of them at a time and insert it into the table
    def insert_by_state(self, state):
        csv_name = '../csv/' + state
        f = open(csv_name, 'r')
        csv_reader = csv.reader(f)
        for line in csv_reader:
            acq_row = SqlRow(self.table_name, {
                'state': line[0],
                'station_name': line[1],
                'nsn': line[2],
                'item_name': line[3],
                'quantity': line[4],
                'ui': line[5],
                'acquisition_value': line[6],
                'demil_code': line[7],
                'demil_ic': line[8],
                'ship_date': line[9],
                'station_type': line[10],
            })
            self.table.insert(acq_row)

        f.close()
