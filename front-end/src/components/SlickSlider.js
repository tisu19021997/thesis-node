import React from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

const SlickSlider = (props) => {
  const { children, settings } = props;

  return (
    <Slider
      settings={settings}
    >
      {children}
    </Slider>
  );
};

SlickSlider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  settings: PropTypes.object.isRequired,
};


export default SlickSlider;
