import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { includes, pick } from 'lodash';

class Bundle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalPrice: 0,
      selected: [],
      selectedProducts: [],
    };

    this.updateBundle = this.updateBundle.bind(this);
    this.purchaseAll = this.purchaseAll.bind(this);
  }

  componentDidMount() {
    const { bundleProductIds, totalPrice } = this.props;
    const { selected } = this.state;

    // set the initial state for selected products
    if (!selected.length) {
      this.setState({
        totalPrice,
        selected: bundleProductIds,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { bundleProductIds, currentProduct, totalPrice } = this.props;

    // only update state when the product is changed,
    // i.e user goes to the other product's page
    if (prevProps.currentProduct.asin !== currentProduct.asin) {
      this.setState({
        totalPrice,
        selected: bundleProductIds,
      });
    }
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
      selected = [...selected, checkedProduct[0]];
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

  async purchaseAll() {
    const { purchaseAll, bundleProducts } = this.props;
    const { selected } = this.state;

    // filter the products from the bundle with the selected ids
    const selectedProducts = await bundleProducts.filter((product) => (
      includes(selected, product._id)
    ));

    await purchaseAll(selectedProducts);
  }

  render() {
    const { bundleProducts, currentProduct, user } = this.props;
    const { totalPrice, selected } = this.state;

    const productImgList = bundleProducts.map((product, index) => (
      <li
        key={product.asin}
        className={selected.includes(product._id)
          ? 'o-layout__item c-bundle__product'
          : 'o-layout__item c-bundle__product c-bundle__product--disabled'}
      >
        <Link to={`/product/${product.asin}`}>
          <img className="c-bundle__img" src={product.imUrl} alt={product.name} />
        </Link>

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
          id={product._id}
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
                {' '}
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
      <>

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
              {' '}
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
              onClick={this.purchaseAll}
              className="c-btn [ c-btn--cta c-btn--rounded c-btn--type-large c-btn--stretch ] u-mt-12">
              Add All to Cart
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


      </>
    );
  }
}

Bundle.propTypes = {
  bundleProducts: PropTypes.array.isRequired,
  bundleProductIds: PropTypes.array.isRequired,
  currentProduct: PropTypes.object.isRequired,
  totalPrice: PropTypes.number.isRequired,
};

export default Bundle;
