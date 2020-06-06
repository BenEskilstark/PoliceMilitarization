// @flow

const React = require('react');
const Button = require('./ui/Button.react');
const Divider = require('./ui/Divider.react');
const Dropdown = require('./ui/Dropdown.react');
const {useEffect, useMemo, useState} = React;

type Props = {};

const headerStyle = {
  textAlign: 'center',
  // backgroundColor: 'lightgray',
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
const tableStyle = {
  backgroundColor: '#faf8ef',
  width: '100%',
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
    const queryParams = filtersToQueryParams({...filters, item_name: null});
    getFromServer(`/distinct/item_name${queryParams}`, (resp) => {
      const rows = JSON.parse(resp).rows;
      const items = rows.map(obj => obj.item_name);
      setItems(items);
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
        <Button
          label="Search"
          onClick={() => {
            const queryParams = filtersToQueryParams(filters);
            getFromServer('/query/police' + queryParams, (res) => {
              setQueryResult(JSON.parse(res));
            })
          }}
        />
        <div>
          Total Value of Searched Equipment: <b>${totalCost.toLocaleString()}</b>
        </div>
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
  const rect = document.getElementById('search').getBoundingClientRect();
  const searchBarOffset = rect.top + rect.height;

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
    <div style={tableStyle}>
      <table style={{
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
