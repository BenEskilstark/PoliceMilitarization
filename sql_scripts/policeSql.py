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
            'acquisition_value': 'real',
            'ship_date': 'text',
        }
        self.table_name = 'police'
        self.table = SqlTable(self.table_name, columns)

    # each state/territory is a different csv. This function
    # will load one of them at a time and insert it into the table
    # The file names for states are weird (and some are misspelled!)
    # so just provide the file name instead of trying to match
    # a state name to the correct file
    def insert_by_state(self, state_file_name):
        csv = open(state_file_name, 'r')
        for line in csv:
            values = line.split(',')
            acq_row = SqlRow(self.table_name, {
                'state': values[0],
                'state_name': values[1],
                'nsn': values[2],
                'item_name': values[3],
                'quantity': values[4],
                'ui': values[5],
                'acquisition_value': values[6],
                'demil_code': values[7],
                'demil_ic': values[8],
                'ship_date': values[9],
                'station_type': values[10],
            })
            self.table.insert(acq_row)

        csv.close()
