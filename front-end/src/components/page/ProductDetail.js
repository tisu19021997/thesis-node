import React from 'react';
import PropTypes from 'prop-types';
import {
  Tab,
  Tabs,
  TabList,
  TabPanel,
} from 'react-tabs';
import axios from 'axios';
import { withCookies } from 'react-cookie';
import Wrapper from '../Wrapper';
import Section from '../Section';
import Breadcrumb from '../Breadcrumb';
import ProductZoom from '../ProductZoom';
import Bundle from '../Bundle';
import ProductSlider from '../slider/ProductSlider';
import PrevArrow from '../slider/PrevArrow';
import NextArrow from '../slider/NextArrow';


class ProductDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      product: {},
      alsoBought: {},
      alsoViewed: {},
      bundleProducts: {},
      sameCategory: {},
      ready: false,
    };

    this.purchaseHandle = this.purchaseHandle.bind(this);
    this.purchaseAllHandle = this.purchaseAllHandle.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;

    // Make a call to server to get the necessary data

    axios.get(`/product/${params.asin}`)
      .then((res) => {
        const {
          product, alsoBought, alsoViewed, bundleProducts, sameCategory,
        } = res.data;

        this.setState({
          product,
          alsoBought,
          alsoViewed,
          bundleProducts,
          sameCategory,
          ready: true,
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { match } = this.props;
    const { params } = match;

    if (prevProps.match.params !== params) {
      axios.get(`/product/${params.asin}`)
        .then((res) => {
          const {
            product, alsoBought, alsoViewed, bundleProducts, sameCategory,
          } = res.data;

          this.setState({
            product,
            alsoBought,
            alsoViewed,
            bundleProducts,
            sameCategory,
            ready: true,
          });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    }
  }

  purchaseHandle() {
    const { product } = this.state;
    const {
      updateCart,
      loggedIn,
      currentUser,
      shoppingCart
    } = this.props;

    if (loggedIn) {
      // send request to update the cart in user
      axios.put(`/user/${currentUser}/purchaseOne`, product)
        .then((res) => {
          // TODO: Get the successful message and display it to UI
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } else {
      // TODO: implement cart update after purchasing using cookies
    }
    updateCart([...shoppingCart, product]);
  }

  purchaseAllHandle(products) {
    const {
      currentUser, loggedIn, onBundlePurchase,
    } = this.props;

    onBundlePurchase(products);

    if (loggedIn) {
      axios.put(`/user/${currentUser}/purchaseAll`, products)
        .then((res) => {

        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } else {

    }
  }

  render() {
    const { ready } = this.state;

    // stop the rendering if data is not fetched
    if (!ready) {
      return false;
    }

    const {
      product,
      bundleProducts,
      alsoBought,
      alsoViewed,
      sameCategory,
    } = this.state;

    const { categories } = product;

    const sliderSettings = {
      slidesToShow: 6,
      slidesToScroll: 6,
      arrows: true,
      infinite: false,
      prevArrow: <PrevArrow />,
      nextArrow: <NextArrow />,
    };

    const bundleIds = bundleProducts.products.map((bundleProduct) => {
      return bundleProduct._id;
    });

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
                    onClick={this.purchaseHandle}
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
          {bundleProducts
            ? (
              <Section
                className="u-6/10"
                title="Usually Bought Together"
                titleClass="c-section__title--no-margin"
              >

                <Bundle
                  bundleProducts={[product, ...bundleProducts.products]}
                  bundleProductIds={[product._id, ...bundleIds]}
                  currentProduct={product}
                  totalPrice={bundleProducts.totalPrice}
                  purchaseAll={this.purchaseAllHandle}
                />
              </Section>
            )
            : ''}
          {/* /BUNDLE PRODUCT */}


          <hr />


          {/* #ViEWED ALSO VIEWED */}
          {alsoViewed.length
            ? (
              <Section
                title="Customers who viewed this item also viewed"
                titleClass="c-section__title--no-margin"
              >

                <ProductSlider
                  products={alsoViewed}
                  settings={sliderSettings}
                  className="c-slider--tiny-gut u-ph-48"
                />

              </Section>
            )
            : ''}
          {/* /ViEWED ALSO VIEWED */}


          {/* #TABS */}
          <Tabs className="c-tab u-mt-36 u-mb-24">
            <TabList className="c-tab__header u-border--m-blur">
              <Tab
                className="c-tab__header-name u-txt-14"
                selectedClassName="active"
              >
                Description
              </Tab>
              <Tab
                className="c-tab__header-name u-txt-14"
                selectedClassName="active"
              >
                Additional Information
              </Tab>
              <Tab
                className="c-tab__header-name u-txt-14"
                selectedClassName="active"
              >
                Customer Q&A
              </Tab>
              <Tab
                className="c-tab__header-name u-txt-14"
                selectedClassName="active"
              >
                Customer Reviews
              </Tab>
            </TabList>


            <div className="c-tab__content">

              <TabPanel className="c-tab__content-item u-txt--normal u-txt-14 u-2/3">
                {product.description}
              </TabPanel>

              <TabPanel className="c-tab__content-item u-txt--normal u-txt-14">
                {/* Example Table */}
                <div className="c-table">
                  <div className="c-table__row">
                    <div className="c-table__row-col c-table__attr">
                      Package Dimensions
                    </div>
                    <div className="c-table__row-col c-table__value">
                      13.6 x 6.6 x 1.9 inches
                    </div>
                  </div>
                  <div className="c-table__row">
                    <div className="c-table__row-col c-table__attr">
                      Weight
                    </div>
                    <div className="c-table__row-col c-table__value">
                      2.33 pounds
                    </div>
                  </div>
                  <div className="c-table__row">
                    <div className="c-table__row-col c-table__attr">
                      Color
                    </div>
                    <div className="c-table__row-col c-table__value">
                      Red/Blue/Green/Black
                    </div>
                  </div>
                  <div className="c-table__row">
                    <div className="c-table__row-col c-table__attr">
                      Manufacturer
                    </div>
                    <div className="c-table__row-col c-table__value">
                      Microsoft
                    </div>
                  </div>
                  <div className="c-table__row">
                    <div className="c-table__row-col c-table__attr">
                      Status
                    </div>
                    <div className="c-table__row-col c-table__value">
                      Out of Stock
                    </div>
                  </div>
                </div>
                {/* /Example Table */}
              </TabPanel>

              <TabPanel className="c-tab__content-item u-txt-14" />

              <TabPanel className="c-tab__content-item u-txt-14" />

            </div>
          </Tabs>
          {/* /TABS */}


          {/* #BOUGHT ALSO BOUGHT */}
          {alsoBought.length
            ? (
              <Section
                title="Customers who bought this item also bought"
                titleClass="c-section__title--no-margin"
              >

                <ProductSlider
                  products={alsoBought}
                  settings={sliderSettings}
                  className="c-slider--tiny-gut u-ph-48"
                />


              </Section>
            )
            : ''}
          {/* /BOUGHT ALSO BOUGHT */}


          {/* #SAME CATGORY */}
          {sameCategory.length
            ? (
              <Section
                title="From the same category"
                titleClass="c-section__title--no-margin"
              >

                <ProductSlider
                  products={sameCategory}
                  settings={sliderSettings}
                  className="c-slider--tiny-gut u-ph-48"
                />


              </Section>
            )
            : ''}
          {/* /SAME CATEGORY */}

        </main>
      </Wrapper>
    );
  }
}

ProductDetail.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  currentUser: PropTypes.string.isRequired,
  updateCart: PropTypes.func.isRequired,
  onBundlePurchase: PropTypes.func.isRequired,
  shoppingCart: PropTypes.array.isRequired,
  // eslint-disable-next-line react/require-default-props
  match: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default withCookies(ProductDetail);
