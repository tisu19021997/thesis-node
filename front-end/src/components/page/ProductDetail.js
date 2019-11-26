import React from 'react';
import { Link } from 'react-router-dom';
import Wrapper from '../Wrapper';
import Section from '../Section';
import Breadcrumb from '../Breadcrumb';
import ProductZoom from '../ProductZoom';

const axios = require('axios');

class ProductDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      product: {},
    };
  }

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;

    axios.get(`/product/${params.asin}`)
      .then((res) => {
        const { product } = res.data;

        this.setState({
          product,
          ready: true,
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  render() {
    const { ready } = this.state;

    // stop the rendering if data is not fetched
    if (!ready) {
      return false;
    }

    const { product } = this.state;
    const { categories } = product;

    return (
      <Wrapper className="u-ph-0">
        <main>

          {/* #PRODUCT PREVIEW */}
          <section className="c-section" data-section="Product Preview">

            {/* #BREADCRUMB */}
            <Breadcrumb breadcrumbItems={categories} />
            {/* /BREADCRUMB */}


            {/* #PRODUCT VIEW BLOCK */}
            <div className="o-layout [ o-layout--small ]">

              {/* #PRODUCT IMAGE ZOOM */}
              <section className="o-layout__item u-3/10 u-margin-top" data-section="Product Images">
                <ProductZoom
                  // array of imUrl for demo-ing, need to change
                  productImages={[
                    product.imUrl,
                    product.imUrl,
                    product.imUrl,
                  ]}
                />
              </section>
              {/* /PRODUCT IMAGE ZOOM */}


              {/* #PRODUCT DETAIL */}
              <section className="o-layout__item u-4/10 u-push-1/20" data-section="Product Detail">

                <div className="[ u-txt--title u-txt--dark u-txt--bold ] u-margin-bottom-small">
                  {product.title}
                </div>

                <div className="u-margin-top-small u-margin-bottom-tiny u-cf">

                  <span className="[ u-txt--tiny ]">
                    Brand:
                    <span className="[ u-txt--bright u-txt--xbold ]">{product.brand}</span>
                  </span>

                  <div className="[ u-float-right u-d-flex u-fd--column ]">
                    <span className="[ u-txt--tiny u-txt--light ]">12,345 ratings</span>
                  </div>

                  {/* #OPTIONS */}
                  <div className="c-option [ c-option--bordered ]">

                    <p className="c-option__detail">
                      Color:
                      <span className="c-option__value">White Black</span>
                    </p>

                    <ul
                      className="o-layout o-carousel [ o-carousel--8col o-carousel--tiny ] c-option__control"
                    >
                      <li className="o-layout__item o-carousel__item ">
                        <img className="c-option__img" src={product.imUrl} alt={product.title} />
                      </li>

                    </ul>
                  </div>
                  {/* /OPTIONS */}


                  {/* #INFORMATION PRODUCT */}
                  <section className="u-cf" data-section="Product Information">
                    <ul className="[ u-txt-12 u-margin-bottom-none u-margin-left-small ]">
                      <li>
                        <span>{product.description}</span>
                      </li>
                    </ul>
                    <a href="/" className="u-float-left u-txt-10 u-txt-underline">
                      <span>
                        <i className="fas fa-caret-down" />
                        More
                      </span>
                    </a>
                  </section>
                  {/* /Product information */}

                </div>

              </section>
              {/* /Product Detail */}


              {/* #CTA */}
              <section className="o-layout__item u-2/10 u-push-1/10" data-section="Call to Action">

                <div className="o-list-inline">
                  <div className="o-list-inline__item t-price u-txt--larger">
                    <span className="u-txt-16">$</span>
                    {product.price}
                  </div>


                  <div
                    className="o-list-inline__item t-price--before u-txt-linethrough  u-txt--light"
                  >
                    <span className="u-txt-12">$</span>
                    7.99
                  </div>
                </div>


                <div className="c-option [ c-option--control ] u-margin-top-small">
                  <div className="c-option__board">
                    <label className="u-txt--blur u-txt-12 u-mr-6">Quantity: </label>
                    <input
                      className="js-option-screen"
                      id="qty"
                      type="number"
                      min={0}
                      defaultValue={1}
                    />
                  </div>
                </div>


                {/* #CTA-BUTTONS */}
                <div className="u-d-flex u-fd--column u-margin-top u-margin-bottom-large">
                  <button
                    className="c-btn [ c-btn--cta c-btn--rounded c-btn--type-large ] u-flex-1 u-margin-bottom-small"
                    type="submit"
                    title="Buy Now"
                  >
                    Buy Now
                  </button>
                  <button
                    className="c-btn [ c-btn--primary c-btn--rounded c-btn--type-large ] u-flex-1"
                    type="button"
                    title="Add to Cart"
                  >
                    Add to Cart
                  </button>
                </div>
                {/* #CTA-BUTTONS */}


                {/* #SAME BRAND */}
                <section className="c-section" data-section="Same Brand Products">
                  <div className="c-section__title [ c-section__title--no-margin ]">
                    From our brand
                  </div>
                  <ul className="o-list-bare">
                    <li className="o-media c-product [ c-product--secondary ]">
                      <img
                        src={product.imUrl}
                        className="o-media__img c-product__img u-w--30 u-mr-6"
                        alt="Product 1"
                      />
                      <div className="o-media__body">
                        <div className="c-product__name u-txt--bold">
                          {product.title}
                        </div>
                        <div className="c-product__rating">
                          <i className="fas fa-star [ tiny rect ]" data-rating={1} />
                          <i className="fas fa-star [ tiny rect ]" data-rating={2} />
                          <i className="fas fa-star [ tiny rect ]" data-rating={3} />
                          <i className="fas fa-star [ tiny rect ]" data-rating={4} />
                          <i className="fas fa-star [ tiny rect ]" data-rating={5} />
                        </div>
                        <div className="c-price [ c-price--small ] ">
                          <div className="c-price__price">
                            <span className="c-price__currency">$</span>
                            {product.price}
                          </div>
                          <div className="c-price__price--secondary">
                            <span className="c-price__currency">$</span>
                            7.99
                          </div>
                        </div>
                      </div>
                    </li>

                  </ul>
                </section>
                {/* /Same brand */}


              </section>
              {/* /CTA */}


            </div>
            {/* /PRODUCT VIEW BLOCK */}


          </section>
          {/* #PRODUCT PREVIEW */}


          <hr />


          {/* #BUNDLE PRODUCT */}
          <Section title="Usually Bought Together" titleClass="c-section__title--no-margin">

            <div className="o-layout [ o-layout--tiny ]">
              <div className="o-layout__item u-2/3">
                <ul className="c-bundle u-m-0">
                  <div className="o-layout [ o-layout--flush ]">
                    <li
                      className="o-layout__item c-bundle__product [ c-bundle__product--disabled ]">
                      <span>
                        <Link to={`/product/${product.asin}`}>
                          <img
                            className="c-bundle__img"
                            src={product.imUrl}
                            alt="Sample Product"
                          />
                        </Link>
                      </span>
                      <span className="c-bundle__separator">+</span>
                    </li>
                  </div>
                </ul>
                {/* /Bundle */}
              </div>
              <div className="o-layout__item u-1/3">
                <div className="u-txt--bold u-txt-14">
                  Total:
                  <span className="c-price [ c-price--small ]">
                <span className="c-price__price">
                  <span className="c-price__currency">$</span>25.98
                </span>
              </span>
                </div>
                <button
                  className="c-btn [ c-btn--cta c-btn--rounded c-btn--type-large c-btn--stretch ] u-mt-12">
                  Add Both to Cart
                </button>
              </div>
            </div>
            <form className="o-layout [ o-layout--tiny ] u-mt-12">
              <div className="o-layout__item u-2/3">
                <ul className="o-list-bare">
                  <li className="o-list-bare__item u-pos-relative">
                    <input type="checkbox" name={1} defaultValue={1} />
                    <label htmlFor={1} className="u-txt-14">DualShock 4 Wireless Controller for
                      PlayStation -
                      Dark Blue
                      <span className="c-price c-price--small u-pos-absolute u-pos-left-100">
                    <span className="c-price__price">
                      <span className="c-price__currency">$</span>10.99
                    </span>
                  </span>
                    </label>
                  </li>
                  <li className="o-list-bare__item u-pos-relative">
                    <input type="checkbox" name={2} defaultValue={2} defaultChecked />
                    <label htmlFor={2} className="u-txt-14"><span
                      className="u-txt--bold">Current: </span>TriShock 2
                      Wireless Controller for Xbox - Sky Blue
                      <span className="c-price c-price--small u-pos-absolute u-pos-left-100">
                    <span className="c-price__price">
                      <span className="c-price__currency">$</span>14.99
                    </span>
                  </span>
                    </label>
                  </li>
                  <li className="o-list-bare__item u-pos-relative">
                    <input type="checkbox" name={3} defaultValue={3} />
                    <label htmlFor={3} className="u-txt-14">DualShock 4 Wireless Controller for
                      PlayStation
                      <span className="c-price c-price--small u-pos-absolute u-pos-left-100">
                    <span className="c-price__price">
                      <span className="c-price__currency">$</span>16.99
                    </span>
                  </span>
                    </label>
                  </li>
                </ul>
              </div>
            </form>
          </Section>


          {/* /BUNDLE PRODUCT */}

        </main>
      </Wrapper>
    );
  }
}

export default ProductDetail;
