'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('React');

// props:
// id: ?string
// label: string
// onClick: () => void
// onMouseDown: optional () => void
// onMouseUp: optional () => void
// disabled: optional boolean
// fontSize: optional number
// style: optional Object

var Button = function (_React$Component) {
  _inherits(Button, _React$Component);

  function Button() {
    _classCallCheck(this, Button);

    return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
  }

  _createClass(Button, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // document.onkeydown = null;
    }
  }, {
    key: 'render',
    value: function render() {
      var props = this.props;

      var id = props.id || props.label;

      return React.createElement(
        'button',
        { type: 'button',
          style: _extends({
            touchAction: 'initial',
            fontSize: (props.fontSize != null ? props.fontSize : 18) + 'px'
          }, props.style),
          key: id || label,
          className: props.disabled ? 'buttonDisable' : '',
          id: id.toUpperCase() + '_button',
          onClick: props.disabled ? function () {} : props.onClick,
          onTouchStart: props.onMouseDown,
          onTouchEnd: props.onMouseUp,
          onMouseDown: props.onMouseDown,
          onMouseUp: props.onMouseUp,
          disabled: props.disabled
        },
        props.label
      );
    }
  }]);

  return Button;
}(React.Component);

module.exports = Button;