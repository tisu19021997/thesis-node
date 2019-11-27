import React from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

const SlickSlider = (props) => {
  const { children, className, settings, } = props;

  // switch (type) {
  //   case ('screen-1d'):
  //     settings = {
  //       slidesToShow: 1,
  //       slidesToScroll: 1,
  //       arrows: false,
  //       infinite: false,
  //       useTransform: true,
  //       speed: 200,
  //       cssEase: 'cubic-bezier(0.77, 0, 0.18, 1)',
  //       asNavFor: '.js-slider-nav-3d',
  //     };
  //     break;
  //
  //   case ('nav-3d'):
  //     settings = {
  //       slidesToShow: 3,
  //       slidesToScroll: 1,
  //       dots: false,
  //       focusOnSelect: true,
  //       infinite: false,
  //       asNavFor: '.js-slider-screen-1d',
  //     };
  //     break;
  //
  //   default:
  //     settings = {
  //       slidesToShow: 1,
  //       slidesToScroll: 1,
  //     };
  // }

  return (
    <Slider
      className={className}
      {...settings}
    >
      {children}
    </Slider>
  );
};

SlickSlider.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  settings: PropTypes.object,
};

SlickSlider.defaultProps = {
  className: 'c-slider',
};

export default SlickSlider;
