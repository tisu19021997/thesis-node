import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const NextArrow = (props) => {
  const { className, onClick } = props;

  return (
    <button onClick={onClick} type="button" className={`${className} right`}>
      <FontAwesomeIcon icon="angle-right" className="large" />
    </button>
  );
};

NextArrow.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

NextArrow.defaultProps = {
  className: 'slick-arrow',
};

export default NextArrow;
