
const React = require('React');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 */
const Dropdown = function(props: Props) {
  const {options, selected, onChange, displayOptions} = props;
  const optionTags = options.map((option, i) => {
    const label = displayOptions != null && displayOptions[i] != null
      ? displayOptions[i]
      : option;
    return (
      <option key={'option_' + option} value={option}>
        {label}
      </option>
    );
  });

  return (
    <select
      onChange={(ev) => {
        const val = ev.target.value;
        onChange(val);
      }}
      value={selected}
    >
      {optionTags}
    </select>
  );
}

module.exports = Dropdown;
