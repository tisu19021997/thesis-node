import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactRouterPropTypes from 'react-router-prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Product from '../Product';

class ProductSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      sort: this.useQuery()
        .get('sort') || 'featured',
      filters: [
        {
          label: 'Featured',
          value: 'featured',
        },
        {
          label: 'New Arrivals',
          value: 'newest',
        },
        {
          label: 'Low Price',
          value: 'price-asc',
        },
        {
          label: 'High Price',
          value: 'price-desc',
        },
        {
          label: 'Sale Off',
          value: 'sale',
        },
      ],
    };

    this.useQuery = this.useQuery.bind(this);
    this.sortHandle = this.sortHandle.bind(this);

    this.pageUpdate = this.pageUpdate.bind(this);
  }

  componentDidMount() {
    this.pageUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { location } = this.props;
    const { search } = location;

    if (prevProps.location.search !== search) {
      this.pageUpdate();
    }
  }

  pageUpdate() {
    const query = this.useQuery();
    const keyword = query.get('s');
    const page = query.get('page') || 1;

    const { sort } = this.state;

    axios.get(`/products?s=${keyword}&page=${page}&sort=${sort}`)
      .then((res) => {
        const {
          products, totalDocs, hasPrevPage, hasNextPage, prevPage, nextPage, totalPages,
        } = res.data;
        this.setState({
          keyword,
          products,
          totalPages,
          totalDocs,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
          page: parseInt(page, 10),
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  useQuery() {
    const { location } = this.props;
    return new URLSearchParams(location.search);
  }

  sortHandle(e) {
    const { value } = e.target;
    const { keyword, page } = this.state;
    const { history } = this.props;

    this.setState({
      sort: value,
    });

    history.push(`/products/search?s=${keyword}&page=${page}&sort=${value}`);
  }

  render() {
    const { products, keyword } = this.state;

    if (!products.length) {
      return (
        <div className="o-wrapper u-ph-0">

          <main data-section="Main Content">

            <div className="u-mt-12 u-mb-36">
              <span className="u-txt--light u-txt-24">
                No results for<span className="u-txt--bold">{` "${keyword}"`}</span>
              </span>
            </div>


          </main>
        </div>
      );
    }

    const {
      totalPages, totalDocs, hasPrevPage, hasNextPage,
      nextPage, prevPage, page, sort, filters,
    } = this.state;

    const isChecked = (value) => value === sort;

    const filtersDOM = filters.map((filter) => (
      <li key={filter.value} className="o-list-inline__item u-mr-12">
        <input
          type="radio"
          name="filter"
          value={filter.value}
          defaultChecked={isChecked(filter.value)}
          onChange={this.sortHandle}
        />
        <label htmlFor="filter">{filter.label}</label>
      </li>
    ));

    const productsDOM = products.map((product) => (
      <div key={product.asin} className="o-layout__item u-mb-24 u-1/4">

        <Product product={product} />

      </div>
    ));

    const paginationButtons = [];

    for (let i = 1; i <= totalPages; i += 1) {
      paginationButtons.push(
        <Link
          to={{
            pathname: '/products/search',
            search: `?s=${keyword}&page=${i}&sort=${sort}`,
          }}
          key={i}
          href="/"
          className={page === i ? 'c-paging-page c-paging-page--current' : 'c-paging-page'}
        >
          {i}
        </Link>,
      );
    }

    return (
      <div className="o-wrapper u-ph-0">

        <main data-section="Main Content">


          {/*#PAGE-NAME*/}
          <div className="u-mt-12 u-mb-36">
            <span className="u-txt--light u-txt-24">
              Search results for
              <span className="u-txt--bold">{` "${keyword}"`}</span>
            </span>
            <div className="u-float-right u-txt-align-right">
              <span className="u-txt--bold u-txt-24">{totalDocs}</span>
              <div className="u-txt--light u-txt-12">results</div>
            </div>
          </div>
          {/*/Page Name*/}


          {/*#MAIN AREA*/}
          <div className="o-layout o-layout--flush">


            {/*#LEFT COLUMN*/}
            <div className="o-layout__item u-3/10 u-p-12">


              {/*#FILETER LIST*/}
              <div className="u-border-all-blur">
                <ul className="o-list-bare u-border--m-blur u-pb-6 u-p-12">
                  {/*#LIST HEADER*/}
                  <span className="u-txt--bold u-txt-16">Departments</span>
                  {/*#LIST CHILDREN*/}
                  <li className="o-list-bare__item">
                    <ul className="o-list-bare u-txt-14 u-pl-6 u-txt-underline">
                      <span className="u-txt--bold">Video Games</span>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/4">
                          <span>PC Gamepads &amp; Standard Controllers</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/4">
                          <span>GEM Box Microconsole</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/4">
                          <span>Xbox 360 Gamepads &amp; Standard Controllers</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/4">
                          <span>PlayStation 3 Gamepads &amp; Standard Controllers</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="o-list-bare__item">
                    <ul className="o-list-bare u-txt-14 u-pl-6 u-txt-underline">
                      <span className="u-txt--bold">Apps &amp; Games</span>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/1">
                          <span>Games for Kids</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/2">
                          <span>Games</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/3">
                          <span>Sport Games</span>
                        </a>
                      </li>
                      <li className="o-list-bare__item u-pl-6">
                        <a href="/category/4">
                          <span>PlayStation 3 Gamepads &amp; Standard Controllers</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  {/* /List Children */}
                  <div className="u-txt-align-right u-txt-underline u-txt-12 u-mt-12">All
                    Departments
                  </div>
                </ul>
                <ul className="o-list-bare u-border--m-blur u-pb-6 u-p-12">
                  {/*#LIST HEADER*/}
                  <span className="u-txt--bold u-txt-16">Ratings</span>
                  {/*#LIST CHILDREN*/}
                  <li className="u-txt-14 u-txt-underline o-list-bare__item u-pl-6">
                    <a href="/category/4">
                      <span>From 4 stars</span>
                    </a>
                  </li>
                  <li className="u-txt-14 u-txt-underline o-list-bare__item u-pl-6">
                    <a href="/category/4">
                      <span>From 3 stars</span>
                    </a>
                  </li>
                  <li className="u-txt-14 u-txt-underline o-list-bare__item u-pl-6">
                    <a href="/category/4">
                      <span>From 2 stars</span>
                    </a>
                  </li>
                  <li className="u-txt-14 u-txt-underline o-list-bare__item u-pl-6">
                    <a href="/category/4">
                      <span>From 1 stars</span>
                    </a>
                  </li>
                  {/* /List Children */}
                </ul>
                <ul className="o-list-bare u-mb-0 u-p-12">
                  {/*#LIST HEADER*/}
                  <span className="u-txt--bold u-txt-16">Brands</span>
                  {/*#LIST CHILDREN*/}
                  <li className="u-txt-14 o-list-bare__item u-pl-6">
                    <input type="checkbox" name="brands" />
                    <label htmlFor="brands">SteelSeries</label>
                  </li>
                  <li className="u-txt-14 o-list-bare__item u-pl-6">
                    <input type="checkbox" name="brands" />
                    <label htmlFor="brands">Logitech</label>
                  </li>
                  <li className="u-txt-14 o-list-bare__item u-pl-6">
                    <input type="checkbox" name="brands" />
                    <label htmlFor="brands">IFYOO</label>
                  </li>
                  <li className="u-txt-14 o-list-bare__item u-pl-6">
                    <input type="checkbox" name="brands" />
                    <label htmlFor="brands">Microsoft</label>
                  </li>
                  <li className="u-txt-14 o-list-bare__item u-pl-6">
                    <input type="checkbox" name="brands" />
                    <label htmlFor="brands">EasySMX</label>
                  </li>
                  {/* /List Children */}
                  <div className="u-txt-align-right u-txt-underline u-txt-12 u-mt-12">All Brands
                  </div>
                </ul>
              </div>
              {/* /Filter list */}


              {/*#ADS*/}
              <div className="u-txt-align-center u-mt-24">
                <img src="asset/img/ads-left.png" alt="Sock Sale Is Coming" />
              </div>
              {/* /Ads */}


            </div>
            {/* /Left Column */}


            {/*#RIGHT COLUMN*/}
            <div className="o-layout__item u-7/10 u-pt-6">


              {/*#SORT*/}
              <ul className="o-list-inline u-pl-12 u-txt-16">
                <span className="u-txt-14 u-txt-underline u-mr-12">Sort by:</span>
                {filtersDOM}
              </ul>
              {/* /Sort */}


              {/*#PRODUCTS*/}
              <div className="o-layout o-layout--medium u-pl-48">
                {productsDOM}
              </div>
              {/*/Products*/}


              {/*#PAGINATION*/}
              <div className="c-paging u-txt-align-center u-pv-12 u-border-all-blur">

                {hasPrevPage
                  ? (
                    <Link
                      to={location => `${location.pathname}?s=${keyword}&page=${prevPage}&sort=${sort}`}
                      className="c-paging-prev"
                    >
                      <FontAwesomeIcon icon="chevron-left" />
                    </Link>
                  )
                  : ''}


                {paginationButtons}

                {hasNextPage
                  ? (
                    <Link
                      to={location => `${location.pathname}?s=${keyword}&page=${nextPage}&sort=${sort}`}
                      className="c-paging-next"
                    >
                      <FontAwesomeIcon icon="chevron-right" />
                    </Link>
                  )
                  : ''}

              </div>
              {/* /Pagination */}


            </div>


          </div>


        </main>

      </div>
    );
  }
}

ProductSearch.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
};

export default withRouter(ProductSearch);
