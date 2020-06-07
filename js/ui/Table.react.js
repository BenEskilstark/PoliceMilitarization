// @flow

const React = require('react');
const Button = require('./Button.react');
const {useEffect, useMemo, useState} = React;

type ColumnName = string;
type Props = {
  columns: {[name: ColumnName]: {
    displayName: string,
    sortFn: ?() => number, // sorts alphanumerically if not provided
  }},
  rows: Array<{[name: ColumnName]: mixed}>,
};

const tableStyle = {
  backgroundColor: '#faf8ef',
  width: '100%',
};

function Table(props: Props): React.Node {
  const {columns, rows} = props;
  const colNames = Object.keys(columns);

  const [sortByColumn, setSortByColumn] = useState({by: 'ASC', name: null});

  const headers = colNames.map(col => {
    return (
      <th>
        {columns[col].displayName}
        <div style={{fontWeight: 'normal'}}>
          Sort:
          <Button
            label="/\"
            fontSize={12}
            onClick={() => {
              setSortByColumn({by: 'ASC', name: col});
            }}
          />
          <Button
            label="\/"
            fontSize={12}
            onClick={() => {
              setSortByColumn({by: 'DESC', name: col});
            }}
          />
        </div>
      </th>
    )
  });

  const sortedRows = useMemo(() => {
    if (sortByColumn.name == null) return rows;
    let sorted = [];
    if (columns[sortByColumn.name].sortFn != null) {
      sorted = [...rows].sort(columns[sortByColumn.name].sortFn);
    } else {
      sorted = [...rows].sort((rowA, rowB) => {
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

  const rowHTML = sortedRows.map(row => {
    const rowData = colNames.map(col => (<td>{row[col]}</td>));
    return <tr>{rowData}</tr>;
  });

  return (
    <table style={tableStyle}>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>
        {rowHTML}
      </tbody>
    </table>
  );
}

module.exports = Table;
