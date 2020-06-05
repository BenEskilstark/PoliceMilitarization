'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Main = require('./Main.react');

function renderUI() {
  ReactDOM.render(React.createElement(Main, null), document.getElementById('container'));
}

renderUI();