// @flow

const React = require('react');
const ReactDOM = require('react-dom');
const Main = require('./Main.react');

function renderUI(): void {
  ReactDOM.render(
    <Main />,
    document.getElementById('container'),
  );
}

renderUI();
