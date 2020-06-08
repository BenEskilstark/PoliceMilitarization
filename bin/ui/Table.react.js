'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
var Button = require('./Button.react');
var useEffect = React.useEffect,
    useMemo = React.useMemo,
    useState = React.useState;


var tableStyle = {
  backgroundColor: '#faf8ef',
  width: '100%'
};

function Table(props) {
  var columns = props.columns,
      rows = props.rows;

  var colNames = Object.keys(columns);

  var _useState = useState({ by: 'ASC', name: null }),
      _useState2 = _slicedToArray(_useState, 2),
      sortByColumn = _useState2[0],
      setSortByColumn = _useState2[1];

  var headers = colNames.map(function (col) {
    return React.createElement(
      'th',
      null,
      columns[col].displayName,
      React.createElement(
        'div',
        { style: { fontWeight: 'normal' } },
        'Sort:',
        React.createElement(Button, {
          label: '/\\',
          fontSize: 12,
          onClick: function onClick() {
            setSortByColumn({ by: 'ASC', name: col });
          }
        }),
        React.createElement(Button, {
          label: '\\/',
          fontSize: 12,
          onClick: function onClick() {
            setSortByColumn({ by: 'DESC', name: col });
          }
        })
      )
    );
  });

  var sortedRows = useMemo(function () {
    if (sortByColumn.name == null) return rows;
    var sorted = [];
    if (columns[sortByColumn.name].sortFn != null) {
      sorted = [].concat(_toConsumableArray(rows)).sort(columns[sortByColumn.name].sortFn);
    } else {
      sorted = [].concat(_toConsumableArray(rows)).sort(function (rowA, rowB) {
        if (rowA[sortByColumn.name] < rowB[sortByColumn.name]) {
          return -1;
        }
        return 1;
      });
    }
    if (sortByColumn.by != 'ASC') {
      return sorted.reverse();
    }
    return sorted;
  }, [sortByColumn, rows]);

  var rowHTML = sortedRows.map(function (row) {
    var rowData = colNames.map(function (col) {
      return React.createElement(
        'td',
        null,
        row[col]
      );
    });
    return React.createElement(
      'tr',
      null,
      rowData
    );
  });

  return React.createElement(
    'table',
    { style: tableStyle },
    React.createElement(
      'thead',
      null,
      React.createElement(
        'tr',
        null,
        headers
      )
    ),
    React.createElement(
      'tbody',
      null,
      rowHTML
    )
  );
}

module.exports = Table;