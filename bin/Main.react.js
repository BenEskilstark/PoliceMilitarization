'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
var Button = require('./ui/Button.react');
var Divider = require('./ui/Divider.react');
var Dropdown = require('./ui/Dropdown.react');
var SearchableDropdown = require('./ui/SearchableDropdown.react');
var Table = require('./ui/Table.react');
var useEffect = React.useEffect,
    useMemo = React.useMemo,
    useState = React.useState;


var headerStyle = {
  textAlign: 'center'
  // backgroundColor: 'lightgray',
};
var searchBox = {
  width: 'fit-content',
  border: '1px solid black',
  boxShadow: '0 1px #555555',
  padding: '4px'
};
var queryStyle = {
  top: 0,
  left: 0,
  padding: '2px',
  paddingLeft: '4px',
  // backgroundColor: 'lightgray',
  width: '100%',
  borderBottom: '1px solid black',
  boxShadow: '0 1px #555555',
  zIndex: 1
};

function Main(props) {
  // filter-related state
  var _useState = useState([]),
      _useState2 = _slicedToArray(_useState, 2),
      states = _useState2[0],
      setStates = _useState2[1];

  var _useState3 = useState([]),
      _useState4 = _slicedToArray(_useState3, 2),
      stations = _useState4[0],
      setStations = _useState4[1];

  var _useState5 = useState([]),
      _useState6 = _slicedToArray(_useState5, 2),
      items = _useState6[0],
      setItems = _useState6[1];
  // load list of states once


  useEffect(function () {
    getFromServer('/distinct/state', function (resp) {
      var rows = JSON.parse(resp).rows;
      var states = rows.map(function (obj) {
        return obj.state;
      }).filter(function (s) {
        return s != '';
      });
      setStates(states);
      setFilters(_extends({}, filters, { state: 'CA' }));
    });
  }, []);

  var _useState7 = useState({ item_name: 'ALL' }),
      _useState8 = _slicedToArray(_useState7, 2),
      filters = _useState8[0],
      setFilters = _useState8[1];

  // after states are loaded, do a check for URL params


  useEffect(function () {
    if (states.length == 0) return;
    if (window.location.search != '') {
      var queryStr = '/query/police' + window.location.search;
      getFromServer(queryStr, function (res) {
        setQueryResult(JSON.parse(res));
      });
      // set filters to match URL
      var params = new URLSearchParams(window.location.search);
      var newFilters = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = params.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          newFilters[key] = params.get(key);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      setFilters(newFilters);
    }
  }, [states]);

  // load list of stations whenever selected state changes
  useEffect(function () {
    if (filters.state == null) return;
    getFromServer('/distinct/station_name?state=' + filters.state, function (resp) {
      var rows = JSON.parse(resp).rows;
      var stations = rows.map(function (obj) {
        return obj.station_name;
      });
      setStations(stations);
      if (!stations.includes(filters.station_name)) {
        setFilters(_extends({}, filters, { station_name: stations[0] }));
      }
    });
  }, [filters.state]);

  // load list of items whenever selected state or station changes
  useEffect(function () {
    if (filters.state == null || stations == null) return;
    if (filters.station_name != 'ALL' && !stations.includes(filters.station_name)) return;
    var queryParams = filtersToQueryParams(_extends({}, filters, { item_name: null }));
    getFromServer('/distinct/item_name' + queryParams, function (resp) {
      var rows = JSON.parse(resp).rows;
      var items = rows.map(function (obj) {
        return obj.item_name;
      });
      setItems(items);
      if (filters.item_name != 'ALL' && !items.includes(filters.item_name)) {
        setFilters(_extends({}, filters, { item_name: 'ALL' }));
      }
    });
  }, [filters.state, filters.station_name]);

  // results

  var _useState9 = useState(null),
      _useState10 = _slicedToArray(_useState9, 2),
      queryResult = _useState10[0],
      setQueryResult = _useState10[1];

  // total cost of equipment is the cost of each line-item * the quantity for that line


  var totalCost = useMemo(function () {
    if (queryResult == null || queryResult.rows == null) return 0;
    var cost = 0;
    queryResult.rows.forEach(function (row) {
      cost += parseFloat(row.acquisition_value.slice(1).replace(/,/g, '')) * parseFloat(row.quantity.replace(/,/g, ''));
    });
    return cost;
  }, [queryResult]);
  var numRows = useMemo(function () {
    if (queryResult == null || queryResult.rows == null) return 0;
    return queryResult.rows.length;
  }, [queryResult]);

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { style: headerStyle },
      React.createElement(
        'h1',
        null,
        'Police Militarization'
      ),
      React.createElement(
        'h3',
        {
          style: {
            margin: 'auto',
            maxWidth: '900px',
            fontWeight: 'normal'
          }
        },
        'The Defense Logistics Agency transfers excess Department of Defense equipment to federal, state, and local law enforcement agencies in the United States. The records of these transfers are public information. Use this website to explore what equipment has been delivered to what police departments, or which police departments have been transferred particular kinds of equipment.'
      ),
      React.createElement('p', null),
      React.createElement(
        'h3',
        null,
        React.createElement(
          'a',
          { target: '_blank',
            href: 'https://www.dla.mil/DispositionServices/Offers/Reutilization/LawEnforcement/PublicInformation/' },
          'Original Data Source'
        ),
        React.createElement('div', null),
        React.createElement(
          'a',
          { target: '_blank',
            href: 'https://github.com/BenEskildsen/PoliceMilitarization'
          },
          'Source code for this page'
        )
      )
    ),
    React.createElement(
      'div',
      { style: queryStyle, id: 'search' },
      React.createElement(
        'div',
        { style: searchBox },
        React.createElement(
          'div',
          null,
          React.createElement(
            'b',
            null,
            'Search Terms:'
          )
        ),
        'State:',
        React.createElement(Dropdown, {
          options: ['ALL'].concat(_toConsumableArray(states)),
          selected: filters.state,
          onChange: function onChange(nextState) {
            setFilters(_extends({}, filters, { state: nextState }));
          }
        }),
        'Station:',
        React.createElement(Dropdown, {
          options: ['ALL'].concat(_toConsumableArray(stations)),
          selected: filters.station_name,
          onChange: function onChange(nextStation) {
            setFilters(_extends({}, filters, { station_name: nextStation }));
          }
        }),
        'Equipment Type:',
        React.createElement(Dropdown, {
          options: ['ALL'].concat(_toConsumableArray(items)),
          selected: filters.item_name,
          onChange: function onChange(nextItem) {
            setFilters(_extends({}, filters, { item_name: nextItem }));
          }
        }),
        React.createElement(
          'div',
          null,
          React.createElement(Button, {
            label: 'Search',
            style: { width: 200 },
            fontSize: 24,
            onClick: function onClick() {
              var queryParams = filtersToQueryParams(filters);
              var queryStr = '/query/police' + queryParams;
              getFromServer(queryStr, function (res) {
                setQueryResult(JSON.parse(res));
              });
              var newURL = window.location.origin + window.location.pathname + queryParams;
              window.history.pushState({ path: newURL }, '', newURL);
            }
          })
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'b',
          null,
          'Options search: '
        ),
        'State:',
        React.createElement(SearchableDropdown, {
          options: ['ALL'].concat(_toConsumableArray(states)),
          selected: filters.state,
          onChange: function onChange(nextState) {
            setFilters(_extends({}, filters, { state: nextState }));
          }
        }),
        'Station:',
        React.createElement(SearchableDropdown, {
          options: ['ALL'].concat(_toConsumableArray(stations)),
          selected: filters.station_name,
          onChange: function onChange(nextStation) {
            setFilters(_extends({}, filters, { station_name: nextStation }));
          }
        }),
        'Equipment Type:',
        React.createElement(SearchableDropdown, {
          options: ['ALL'].concat(_toConsumableArray(items)),
          selected: filters.item_name,
          onChange: function onChange(nextItem) {
            setFilters(_extends({}, filters, { item_name: nextItem }));
          }
        })
      ),
      React.createElement(
        'div',
        null,
        'Total Rows Returned: ',
        React.createElement(
          'b',
          null,
          numRows
        )
      ),
      React.createElement(
        'div',
        null,
        'Total Value of Searched Equipment: ',
        React.createElement(
          'b',
          null,
          '$',
          totalCost.toLocaleString()
        )
      )
    ),
    React.createElement(EquipmentTable, { queryResult: queryResult })
  );
}

function EquipmentTable(props) {
  var queryResult = props.queryResult;

  if (queryResult == null || queryResult.rows == null) {
    return null;
  }
  var rows = queryResult.rows.map(function (row) {
    return _extends({}, row, {
      ship_date: row.ship_date.slice(0, -12)
    });
  });
  return React.createElement(Table, {
    columns: {
      state: { displayName: 'State' },
      station_name: { displayName: 'Station Name' },
      item_name: { displayName: 'Item Name' },
      quantity: { displayName: 'Quantity' },
      acquisition_value: {
        displayName: 'Value',
        sortFn: function sortFn(rowA, rowB) {
          var numA = parseFloat(rowA.acquisition_value.slice(1).replace(/,/g, ''));
          var numB = parseFloat(rowB.acquisition_value.slice(1).replace(/,/g, ''));
          return numA - numB;
        }
      },
      ui: { displayName: 'Unit' },
      ship_date: {
        displayName: 'Ship Date',
        sortFn: function sortFn(rowA, rowB) {
          return new Date(rowA.ship_date) - new Date(rowB.ship_date);
        }
      },
      nsn: { displayName: 'NATO Security #' }
    },
    rows: rows
  });
}

function filtersToQueryParams(filters) {
  var queryParams = '?';
  var cols = Object.keys(filters);
  for (var i = 0; i < cols.length; i++) {
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
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) callback(request.responseText);
  };
  request.open("GET", url, true); // true for asynchronous
  request.send(null);
}

module.exports = Main;