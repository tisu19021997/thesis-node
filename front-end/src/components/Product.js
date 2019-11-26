import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Product = (props) => {
  const { product } = props;

  return (
    <Link
      to={`/products/${product.asin}`}
      className="c-product"
    >

      <div className="c-product__img">
        <img src={product.imUrl} alt={product.title} />
      </div>

      <div className="c-product__name">
        {product.title}
      </div>

      <div className="c-price">
        <span className="c-price__price">
          <span className="c-price__currency">$</span>
          {product.price}
        </span>
      </div>

    </Link>
  );
};

Product.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  product: PropTypes.object.isRequired,
};


export default Product;
