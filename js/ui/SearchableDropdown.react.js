
const React = require('React');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 */
const SearchableDropdown = function(props: Props) {
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
    <span>
    <input
      list={"dropdown_" + onChange}
      onChange={(ev) => {
        const val = ev.target.value;
        onChange(val);
      }}
      value={selected}
    />
      <datalist id={"dropdown_" + onChange}>
        {optionTags}
      </datalist>
    </span>
  );
}

module.exports = SearchableDropdown;
