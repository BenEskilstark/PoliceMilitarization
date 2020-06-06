
const http = require('http');
const fs = require('fs');
const urlParser = require('url');
const {Client} = require('pg');

const port = process.env.PORT || 8000;

const server = http.createServer(function(request, response) {
  const url = request.url;
  console.log("requesting", url);
  if (url == '/') {
    fs.readFile('index.html', function(err, data) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
      setVisit();
    });
    return;
  }
  const parsedURL = urlParser.parse(decodeURIComponent(url), true);
  const [empty, dir, file] = parsedURL.pathname.split('/');
  switch (dir) {
    case 'bin': {
      fs.readFile(dir + '/' + file, function(err, data) {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
        response.write(data);
        response.end();
      });
      break;
    }
    case 'css': {
      fs.readFile(dir + '/' + file, function(err, data) {
        response.writeHead(200, {'Content-Type': 'text/css'});
        response.write(data);
        response.end();
      });
      break;
    }
    case 'query': {
      response.writeHead(200, {'Content-Type': 'application/json'});
      const query = urlParser.parse(decodeURIComponent(url), true).query;
      if (file == 'police') {
        executeQueryAndSendResponse(
          response,
          `SELECT
           state, station_name, item_name, quantity, ui, acquisition_value, ship_date
           FROM police`,
          query,
          'station_name',
        );
      }
      break;
    }
    case 'distinct': {
      response.writeHead(200, {'Content-Type': 'application/json'});
      const query = parsedURL.query;
      executeQueryAndSendResponse(
        response,
        `SELECT DISTINCT ${file} FROM police`,
        query,
        file,
      );
      break;
    }
  }
});

const executeQueryAndSendResponse = (response, selectStr, filterObj, orderBy) => {
  // convert query json into sql where conditions
  let filterStr = ' ';
  const cols = Object.keys(filterObj);
  for (let i = 0; i < cols.length; i++) {
    if (i == 0) {
      filterStr += 'WHERE ';
    }
    const col = cols[i];
    filterStr += col + "='" + filterObj[col] + "'";
    if (i < cols.length - 1) {
      filterStr += ' AND ';
    }
  }
  if (orderBy != null) {
    filterStr += ` ORDER BY ${orderBy} ASC`;
  }

  const settings = port == 8000
    ? {database: 'postgres'}
    : {
        connectionString: process.env.DATABASE_URL,
        ssl: {rejectUnauthorized: false},
    };
  const client = new Client(settings);
  const SQLStr = `${selectStr} ${filterStr}`;
  client.connect();
  client.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;', () => {});
  client.query(
    SQLStr,
    (err, res) => {
      if (err) {
        console.error('error for query: ', SQLStr, err);
        response.end();
        client.end();
        return;
      }
      console.log('returning ' + res.rows.length + ' rows for query: ' + SQLStr);
      response.write(JSON.stringify({rows: res.rows}));
      response.end();
      client.end();
    },
  );
}

const setVisit = () => {
  const settings = port == 8000
    ? {database: 'postgres'}
    : {
        connectionString: process.env.DATABASE_URL,
        ssl: {rejectUnauthorized: false},
    };
  const client = new Client(settings);
  client.connect();
  client.query(
    `UPDATE visits
     SET num_visits = num_visits + 1, last_visited = current_timestamp
     WHERE site='police_militarization'`,
    (err, res) => {
      client.end();
    },
  );
};


console.log("server listening on port", port);
server.listen(port);
