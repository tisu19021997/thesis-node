import React from 'react';
import PropTypes from 'prop-types';

const Wrapper = (props) => {
  const { className, children } = props;

  return (
    <div className={`o-wrapper ${className}`}>
      {children}
    </div>
  );
};

Wrapper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Wrapper.defaultProps = {
  className: '',

};

export default Wrapper;
