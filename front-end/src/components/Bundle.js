import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class Bundle extends React.Component {
  static propTypes = {
    bundleProducts: PropTypes.array.isRequired,
    bundleProductIds: PropTypes.array.isRequired,
    currentProduct: PropTypes.object.isRequired,
    totalPrice: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      totalPrice: 0,
      selected: [],
    };

    this.updateBundle = this.updateBundle.bind(this);
  }

  componentDidMount() {
    const {
      bundleProducts, bundleProductIds, currentProduct, totalPrice,
    } = this.props;

    this.setState({
      totalPrice,
      selected: bundleProductIds,
    });

    // Add the current item to the first position of product list
    bundleProducts.unshift(currentProduct);
    bundleProductIds.unshift(currentProduct.asin);
  }

  updateBundle(event) {
    const checkbox = event.target;
    const price = parseFloat(checkbox.value);
    const asin = checkbox.id;
    const { bundleProductIds } = this.props;

    let { totalPrice, selected } = this.state;

    if (checkbox.checked) {
      // re-calculate the total price on check
      totalPrice += price;

      // get the checked product id
      const checkedProduct = bundleProductIds.filter((id) => (id === asin));
      selected.push(checkedProduct[0]);
    } else {
      totalPrice -= price;
      selected = selected.filter((id) => (id !== asin));
    }

    // only takes 2 digits
    totalPrice = Math.round(totalPrice * 100) / 100;

    // apply changes to state
    this.setState({
      totalPrice,
      selected,
    });
  }

  render() {
    const { bundleProducts, currentProduct } = this.props;
    const { totalPrice, selected } = this.state;

    const productImgList = bundleProducts.map((product, index) => (
      <li
        key={product.asin}
        className={selected.includes(product.asin)
          ? 'o-layout__item c-bundle__product'
          : 'o-layout__item c-bundle__product c-bundle__product--disabled'}
      >
        <span>
          <Link to={`/product/${product.asin}`}>
            <img className="c-bundle__img" src={product.imUrl} alt={product.name} />
          </Link>
        </span>
        {index < bundleProducts.length - 1 ? <span className="c-bundle__separator">+</span> : ''}
      </li>
    ));

    const productList = bundleProducts.map((product) => (
      <li
        key={product.asin}
        className="o-list-bare__item u-pos-relative"
      >
        <input
          type="checkbox"
          id={product.asin}
          name="bundle"
          defaultChecked
          onChange={this.updateBundle}
          value={product.price}
        />

        <label htmlFor={product.asin} className="u-txt-14 u-txt-truncate-1">

          {product.asin === currentProduct.asin
            ? (
              <span className="u-txt--bold">
              Current:
              </span>
            )
            : ''}
          {product.title}
          <span className="c-price c-price--small u-pos-absolute u-pos-left-100">
            <span className="c-price__price">
              <span className="c-price__currency">$</span>
              {product.price}
            </span>
          </span>
        </label>

      </li>
    ));

    return (
      <React.Fragment>

        <div className="o-layout [ o-layout--tiny ]">
          {/* #BUNDLE IMAGES */}
          <div className="o-layout__item u-2/3">
            <ul className="c-bundle u-m-0">
              <div className="o-layout o-layout--flush">
                {productImgList}
              </div>
            </ul>
          </div>
          {/* /BUNDLE IMAGES */}


          {/* #BUNDLE CTA */}
          <div className="o-layout__item u-1/3">

            {/* /#TOAL PRICE */}
            <div className="u-txt--bold u-txt-14">
              Total:
              <span className="c-price [ c-price--small ]">
                <span className="c-price__price">
                  <span className="c-price__currency">$</span>
                  {totalPrice}
                </span>
              </span>
            </div>
            {/* /#TOAL PRICE */}


            {/* #CTA BUTTON */}
            <button
              type="button"
              className="c-btn [ c-btn--cta c-btn--rounded c-btn--type-large c-btn--stretch ] u-mt-12">
              Add Both to Cart
            </button>
            {/* #CTA BUTTON */}

          </div>
          {/* #BUNDLE CTA */}
        </div>


        {/* #BUNDLE NAME AND PRICE */}
        <div className="o-layout [ tiny ] u-mt-12">
          <div className="o-layout__item u-2/3">

            <ul className="o-list-bare">
              {productList}
            </ul>

          </div>
        </div>
        {/* /BUNDLE NAME AND PRICE */}


      </React.Fragment>
    );
  }
}

export default Bundle;
