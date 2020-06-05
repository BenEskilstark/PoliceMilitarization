'use strict';

var React = require('React');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 */
var Dropdown = function Dropdown(props) {
  var options = props.options,
      selected = props.selected,
      _onChange = props.onChange,
      displayOptions = props.displayOptions;

  var optionTags = options.map(function (option, i) {
    var label = displayOptions != null && displayOptions[i] != null ? displayOptions[i] : option;
    return React.createElement(
      'option',
      { key: 'option_' + option, value: option },
      label
    );
  });

  return React.createElement(
    'select',
    {
      onChange: function onChange(ev) {
        var val = ev.target.value;
        _onChange(val);
      },
      value: selected
    },
    optionTags
  );
};

module.exports = Dropdown;