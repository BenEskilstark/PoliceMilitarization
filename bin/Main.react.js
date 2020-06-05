'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
var Button = require('./ui/Button.react');
var Divider = require('./ui/Divider.react');
var Dropdown = require('./ui/Dropdown.react');
var useEffect = React.useEffect,
    useMemo = React.useMemo,
    useState = React.useState;


var headerStyle = {};
var queryStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  padding: '2px',
  paddingLeft: '4px',
  backgroundColor: 'lightgray',
  width: '100%',
  borderBottom: '1px solid black',
  boxShadow: '0 1px #555555',
  zIndex: 1
};
var tableStyle = {
  position: 'absolute'
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

  // load list of stations whenever selected state changes


  useEffect(function () {
    if (filters.state == null) return;
    getFromServer('/distinct/station_name?state=' + filters.state, function (resp) {
      var rows = JSON.parse(resp).rows;
      var stations = rows.map(function (obj) {
        return obj.station_name;
      });
      setStations(stations);
      setFilters(_extends({}, filters, { station_name: stations[0] }));
    });
  }, [filters.state]);

  // load list of items whenever selected state or station changes
  useEffect(function () {
    if (filters.state == null) return;
    var queryParams = filtersToQueryParams(filters);
    getFromServer('/distinct/item_name' + queryParams, function (resp) {
      var rows = JSON.parse(resp).rows;
      var items = rows.map(function (obj) {
        return obj.item_name;
      });
      setItems(items);
    });
  }, [filters.state, filters.station_name]);

  // results

  var _useState9 = useState(null),
      _useState10 = _slicedToArray(_useState9, 2),
      queryResult = _useState10[0],
      setQueryResult = _useState10[1];

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { style: queryStyle, id: 'search' },
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
      React.createElement(Dropdown, {
        options: ['ALL'].concat(_toConsumableArray(items)),
        selected: filters.item_name,
        onChange: function onChange(nextItem) {
          setFilters(_extends({}, filters, { item_name: nextItem }));
        }
      }),
      React.createElement(Button, {
        label: 'Search',
        onClick: function onClick() {
          var queryParams = filtersToQueryParams(filters);
          getFromServer('/query/police' + queryParams, function (res) {
            setQueryResult(JSON.parse(res));
          });
        }
      })
    ),
    React.createElement(Table, { queryResult: queryResult })
  );
}

function Table(props) {
  var queryResult = props.queryResult;

  if (queryResult == null || queryResult.rows == null) {
    return null;
  }

  // derive positioning
  var searchBarHeight = document.getElementById('search').getBoundingClientRect().height;

  var rows = queryResult.rows;

  var rowHTML = rows.map(function (row) {
    return React.createElement(
      'tr',
      null,
      React.createElement(
        'td',
        null,
        row.state
      ),
      React.createElement(
        'td',
        null,
        row.station_name
      ),
      React.createElement(
        'td',
        null,
        row.item_name
      ),
      React.createElement(
        'td',
        null,
        row.quantity
      ),
      React.createElement(
        'td',
        null,
        row.ui
      ),
      React.createElement(
        'td',
        null,
        row.acquisition_value
      ),
      React.createElement(
        'td',
        null,
        row.ship_date
      )
    );
  });
  return React.createElement(
    'div',
    { style: {
        position: 'absolute',
        top: searchBarHeight + 'px',
        width: '100%'
      } },
    React.createElement(
      'table',
      { style: {
          width: '100%'
        } },
      React.createElement(
        'tr',
        null,
        React.createElement(
          'th',
          null,
          'State'
        ),
        React.createElement(
          'th',
          null,
          'Station Name'
        ),
        React.createElement(
          'th',
          null,
          'Item Name'
        ),
        React.createElement(
          'th',
          null,
          'Quantity'
        ),
        React.createElement(
          'th',
          null,
          'Unit'
        ),
        React.createElement(
          'th',
          null,
          'Value'
        ),
        React.createElement(
          'th',
          null,
          'Ship Date'
        )
      ),
      rowHTML
    )
  );
}

function filtersToQueryParams(filters) {
  var queryParams = '?';
  var cols = Object.keys(filters);
  for (var i = 0; i < cols.length; i++) {
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
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) callback(request.responseText);
  };
  request.open("GET", url, true); // true for asynchronous
  request.send(null);
}

module.exports = Main;