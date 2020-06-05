// @flow

const React = require('react');

type Props = {

};

function Divider(props: Props): React.Node {
  return (
    <div
      style={{
        width: '100%',
        height: '0px',
        border: '1px solid black',
      }}
    >
    </div>
  );
}

module.exports = Divider;
