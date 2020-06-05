// @flow

const React = require('react');
const Button = require('./ui/Button.react');
const Divider = require('./ui/Divider.react');
const Dropdown = require('./ui/Dropdown.react');
const {useEffect, useMemo, useState} = React;

type Props = {};

const headerStyle = {

};
const queryStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '2px',
  paddingLeft: '4px',
  backgroundColor: 'lightgray',
  width: '100%',
  borderBottom: '1px solid black',
  boxShadow: '0 1px #555555',
  zIndex: 1,
};
const tableStyle = {
  position: 'absolute',
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

  // load list of stations whenever selected state changes
  useEffect(() => {
    if (filters.state == null) return;
    getFromServer(`/distinct/station_name?state=${filters.state}`, (resp) => {
      const rows = JSON.parse(resp).rows;
      const stations = rows.map(obj => obj.station_name);
      setStations(stations);
      setFilters({...filters, station_name: stations[0]});
    });
  }, [filters.state]);

  // load list of items whenever selected state or station changes
  useEffect(() => {
    if (filters.state == null) return;
    const queryParams = filtersToQueryParams(filters);
    getFromServer(`/distinct/item_name${queryParams}`, (resp) => {
      const rows = JSON.parse(resp).rows;
      const items = rows.map(obj => obj.item_name);
      setItems(items);
    });
  }, [filters.state, filters.station_name]);


  // results
  const [queryResult, setQueryResult] = useState(null);

  return (
    <div>
      <div style={queryStyle} id="search">
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
        <Dropdown
          options={['ALL', ...items]}
          selected={filters.item_name}
          onChange={(nextItem) => {
            setFilters({...filters, item_name: nextItem});
          }}
        />
        <Button
          label="Search"
          onClick={() => {
            const queryParams = filtersToQueryParams(filters);
            getFromServer('/query/police' + queryParams, (res) => {
              setQueryResult(JSON.parse(res));
            })
          }}
        />
      </div>
      <Table queryResult={queryResult} />
    </div>
  );
}

function Table(props) {
  const {queryResult} = props;
  if (queryResult == null || queryResult.rows == null) {
    return null;
  }

  // derive positioning
  const searchBarHeight = document.getElementById('search')
    .getBoundingClientRect()
    .height;

  const {rows} = queryResult;
  const rowHTML = rows.map(row => {
    return (
      <tr>
        <td>{row.state}</td>
        <td>{row.station_name}</td>
        <td>{row.item_name}</td>
        <td>{row.quantity}</td>
        <td>{row.acquisition_value}</td>
        <td>{row.ui}</td>
        <td>{row.ship_date}</td>
      </tr>
    );
  });
  return (
    <div style={{
      position: 'absolute',
      top: searchBarHeight + 'px',
      width: '100%',
    }}>
      <table style= {{
        width: '100%',
      }}>
        <tr>
          <th>State</th>
          <th>Station Name</th>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Value</th>
          <th>Unit</th>
          <th>Ship Date</th>
        </tr>
        {rowHTML}
      </table>
    </div>
  );
}

function filtersToQueryParams(filters) {
  let queryParams = '?';
  const cols = Object.keys(filters);
  for (let i = 0; i < cols.length; i++) {
    if (filters[cols[i]] == 'ALL') {
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
