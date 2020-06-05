'use strict';

var React = require('react');

function Divider(props) {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '0px',
      border: '1px solid black'
    }
  });
}

module.exports = Divider;