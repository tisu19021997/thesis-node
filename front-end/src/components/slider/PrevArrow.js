import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PrevArrow = (props) => {
  const { className, onClick } = props;

  return (
    <button onClick={onClick} type="button" className={`${className} left`}>
      <FontAwesomeIcon icon="angle-left" className="large" />
    </button>
  );
};

PrevArrow.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

PrevArrow.defaultProps = {
  className: 'slick-arrow',
};

export default PrevArrow;
