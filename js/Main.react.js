// @flow

const React = require('react');
const Button = require('./ui/Button.react');
const Divider = require('./ui/Divider.react');
const Dropdown = require('./ui/Dropdown.react');
const SearchableDropdown = require('./ui/SearchableDropdown.react');
const Table = require('./ui/Table.react');
const {useEffect, useMemo, useState} = React;

type Props = {};

const headerStyle = {
  textAlign: 'center',
  // backgroundColor: 'lightgray',
};
const searchBox = {
  width: 'fit-content',
  border: '1px solid black',
  boxShadow: '0 1px #555555',
  padding: '4px',
};
const queryStyle = {
  top: 0,
  left: 0,
  padding: '2px',
  paddingLeft: '4px',
  // backgroundColor: 'lightgray',
  width: '100%',
  borderBottom: '1px solid black',
  boxShadow: '0 1px #555555',
  zIndex: 1,
};

function Main(props: Props): React.Node {
  // filter-related state
  const [states, setStates] = useState([]);
  const [stations, setStations] = useState([]);
  const [items, setItems] = useState([]);
  // load list of states once
  useEffect(() => {
    getFromServer('/distinct/state', (resp) => {
      const rows = JSON.parse(resp).rows;
      const states = rows
        .map(obj => obj.state)
        .filter(s => s != '');
      setStates(states);
      setFilters({...filters, state: 'CA'});
    });
  }, []);

  const [filters, setFilters] = useState({item_name: 'ALL'});

  // after states are loaded, do a check for URL params
  useEffect(() => {
    if (states.length == 0) return;
    if (window.location.search != '') {
      const queryStr = '/query/police' + window.location.search;
      getFromServer(queryStr, (res) => {
        setQueryResult(JSON.parse(res));
      });
      // set filters to match URL
      const params = new URLSearchParams(window.location.search);
      const newFilters = {};
      for (const key of params.keys()) {
        newFilters[key] = params.get(key);
      }
      setFilters(newFilters);
    }
  }, [states]);

  // load list of stations whenever selected state changes
  useEffect(() => {
    if (filters.state == null) return;
    getFromServer(`/distinct/station_name?state=${filters.state}`, (resp) => {
      const rows = JSON.parse(resp).rows;
      const stations = rows.map(obj => obj.station_name);
      setStations(stations);
      if (!stations.includes(filters.station_name)) {
        setFilters({...filters, station_name: stations[0]});
      }
    });
  }, [filters.state]);

  // load list of items whenever selected state or station changes
  useEffect(() => {
    if (filters.state == null || stations == null) return;
    if (filters.station_name != 'ALL' && !stations.includes(filters.station_name)) return;
    const queryParams = filtersToQueryParams({...filters, item_name: null});
    getFromServer(`/distinct/item_name${queryParams}`, (resp) => {
      const rows = JSON.parse(resp).rows;
      const items = rows.map(obj => obj.item_name);
      setItems(items);
      if (filters.item_name != 'ALL' && !items.includes(filters.item_name)) {
        setFilters({...filters, item_name: 'ALL'});
      }
    });
  }, [filters.state, filters.station_name]);


  // results
  const [queryResult, setQueryResult] = useState(null);

  // total cost of equipment is the cost of each line-item * the quantity for that line
  const totalCost = useMemo(() => {
    if (queryResult == null || queryResult.rows == null) return 0;
    let cost = 0;
    queryResult.rows.forEach(row => {
      cost += (
        parseFloat(row.acquisition_value.slice(1).replace(/,/g,'')) *
        parseFloat(row.quantity.replace(/,/g,''))
      );
    });
    return cost;
  }, [queryResult]);
  const numRows = useMemo(() => {
    if (queryResult == null || queryResult.rows == null) return 0;
    return queryResult.rows.length;
  }, [queryResult]);

  return (
    <div>
      <div style={headerStyle}>
        <h1>Police Militarization</h1>
        <h3
          style={{
            margin: 'auto',
            maxWidth: '900px',
            fontWeight: 'normal',
          }}
        >
          The Defense Logistics Agency transfers excess Department of Defense equipment
          to federal, state, and local law enforcement agencies in the United States.
          The records of these transfers are public information.
          Use this website to explore what equipment has been delivered to what police
          departments, or which police departments have been transferred particular kinds of
          equipment.
        </h3>
        <p></p>
        <h3>
          <a target="_blank"
            href="https://www.dla.mil/DispositionServices/Offers/Reutilization/LawEnforcement/PublicInformation/">
          Original Data Source</a>
          <div></div>
          <a target="_blank"
            href="https://github.com/BenEskildsen/PoliceMilitarization"
           >
            Source code for this page
          </a>
        </h3>
      </div>
      <div style={queryStyle} id="search">
        <div style={searchBox}>
          <div><b>Search Terms:</b></div>
          State:
          <Dropdown
            options={['ALL', ...states]}
            selected={filters.state}
            onChange={(nextState) => {
              setFilters({...filters, state: nextState});
            }}
          />
          Station:
          <Dropdown
            options={['ALL', ...stations]}
            selected={filters.station_name}
            onChange={(nextStation) => {
              setFilters({...filters, station_name: nextStation});
            }}
          />
          Equipment Type:
          <Dropdown
            options={['ALL', ...items]}
            selected={filters.item_name}
            onChange={(nextItem) => {
              setFilters({...filters, item_name: nextItem});
            }}
          />
          <div>
            <Button
              label="Search"
              style={{width: 200}}
              fontSize={24}
              onClick={() => {
                const queryParams = filtersToQueryParams(filters);
                const queryStr = '/query/police' + queryParams;
                getFromServer(queryStr, (res) => {
                  setQueryResult(JSON.parse(res));
                });
                const newURL = window.location.origin + window.location.pathname + queryParams;
                window.history.pushState({path: newURL}, '', newURL);
              }}
            />
          </div>
        </div>
        <div>
          <b>Options search: </b>
          State:
          <SearchableDropdown
            options={['ALL', ...states]}
            selected={filters.state}
            onChange={(nextState) => {
              setFilters({...filters, state: nextState});
            }}
          />
          Station:
          <SearchableDropdown
            options={['ALL', ...stations]}
            selected={filters.station_name}
            onChange={(nextStation) => {
              setFilters({...filters, station_name: nextStation});
            }}
          />
          Equipment Type:
          <SearchableDropdown
            options={['ALL', ...items]}
            selected={filters.item_name}
            onChange={(nextItem) => {
              setFilters({...filters, item_name: nextItem});
            }}
          />
        </div>
        <div>
          Total Rows Returned: <b>{numRows}</b>
        </div>
        <div>
          Total Value of Searched Equipment: <b>${totalCost.toLocaleString()}</b>
        </div>
      </div>
      <EquipmentTable queryResult={queryResult} />
    </div>
  );
}

function EquipmentTable(props) {
  const {queryResult} = props;
  if (queryResult == null || queryResult.rows == null) {
    return null;
  }
  const rows = queryResult.rows.map(row => {
    return {
      ...row,
      ship_date: row.ship_date.slice(0, -12),
    };
  });
  return (
    <Table
      columns={{
        state: {displayName: 'State'},
        station_name: {displayName: 'Station Name'},
        item_name: {displayName: 'Item Name'},
        quantity: {displayName: 'Quantity'},
        acquisition_value: {
          displayName: 'Value',
          sortFn: (rowA, rowB) => {
            const numA = parseFloat(rowA.acquisition_value.slice(1).replace(/,/g,''));
            const numB = parseFloat(rowB.acquisition_value.slice(1).replace(/,/g,''));
            return numA - numB;
          }
        },
        ui: {displayName: 'Unit'},
        ship_date: {
          displayName: 'Ship Date',
          sortFn: (rowA, rowB) => {
            return new Date(rowA.ship_date) - new Date(rowB.ship_date);
          }
        },
        nsn: {displayName: 'NATO Security #'},
      }}
      rows={rows}
    />
  );
}

function filtersToQueryParams(filters) {
  let queryParams = '?';
  const cols = Object.keys(filters);
  for (let i = 0; i < cols.length; i++) {
    if (filters[cols[i]] == 'ALL' || filters[cols[i]] == null) {
      continue;
    }
    queryParams += cols[i] + '=' + filters[cols[i]];
    if (i < cols.length - 1) {
      queryParams += '&';
    }
  }
  return queryParams;
}

function getFromServer(url, callback) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200)
      callback(request.responseText);
    }
  request.open("GET", url, true); // true for asynchronous
  request.send(null);
}


module.exports = Main;
