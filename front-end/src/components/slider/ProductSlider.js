import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import Product from '../Product';

const ProductSlider = (props) => {
  const { products, settings, className } = props;
  const productList = products.map((product) => (
    <Product key={product.asin} product={product} />
  ));

  return (
    <Slider
      {...settings}
      className={`c-slider ${className}`}
    >
      {productList}
    </Slider>
  );
};

ProductSlider.propTypes = {
  products: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  className: PropTypes.string,
};

ProductSlider.defaultProps = {
  className: '',
};

export default ProductSlider;
