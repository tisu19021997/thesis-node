import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = () => (
  <Router>
    <header className="c-header">


      <nav className="c-header__topnav">
        <div className="c-header__topnav-wrapper">
          <ul className="c-header__topnav-list">
            <li className="c-header__topnav-item">
              <Link to="/sell"><span>Sell</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/registry"><span>Registry</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/gift-cards"><span>Gift Cards</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/buy-again"><span>Buy Again</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/account"><span>Account</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/faq"><span>FAQ</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/history"><span>History</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/registry"><span>Registry</span></Link>
            </li>
            <li className="c-header__topnav-item">
              <Link to="/deals"><span>Today Deals</span></Link>
            </li>
          </ul>
        </div>
      </nav>


      <div className="o-layout c-header__nav">
        <div className="o-layout__item c-header__nav-logo u-1/10 left">

          <Link to="/">
            <svg
              className="c-header__nav-logo-img"
              viewBox="0 0 256 315"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              preserveAspectRatio="xMidYMid"
            >
              <g>
                <path
                  d="M213.803394,167.030943 C214.2452,214.609646 255.542482,230.442639 256,230.644727 C255.650812,231.761357 249.401383,253.208293 234.24263,275.361446 C221.138555,294.513969 207.538253,313.596333 186.113759,313.991545 C165.062051,314.379442 158.292752,301.507828 134.22469,301.507828 C110.163898,301.507828 102.642899,313.596301 82.7151126,314.379442 C62.0350407,315.16201 46.2873831,293.668525 33.0744079,274.586162 C6.07529317,235.552544 -14.5576169,164.286328 13.147166,116.18047 C26.9103111,92.2909053 51.5060917,77.1630356 78.2026125,76.7751096 C98.5099145,76.3877456 117.677594,90.4371851 130.091705,90.4371851 C142.497945,90.4371851 165.790755,73.5415029 190.277627,76.0228474 C200.528668,76.4495055 229.303509,80.1636878 247.780625,107.209389 C246.291825,108.132333 213.44635,127.253405 213.803394,167.030988 M174.239142,50.1987033 C185.218331,36.9088319 192.607958,18.4081019 190.591988,0 C174.766312,0.636050225 155.629514,10.5457909 144.278109,23.8283506 C134.10507,35.5906758 125.195775,54.4170275 127.599657,72.4607932 C145.239231,73.8255433 163.259413,63.4970262 174.239142,50.1987249"
                  fill="#000000"
                />
              </g>
            </svg>
          </Link>

        </div>


        <div className="o-layout__item c-header__nav-search u-6/10">
          <form className="c-searchbar" method="get" role="search" acceptCharset="utf-8">
            <div className="c-searchbar__box">
              <input
                type="search"
                placeholder="Search anything..."
                aria-label="Search"
                data-border="rounded"
              />
              <div className="c-searchbar__button">
                <span className="c-searchbar__button-icon">
                  <FontAwesomeIcon icon="search" className="medium"/>
                </span>
                <input type="submit" defaultValue="Go"/>
              </div>
            </div>
          </form>
        </div>


        <div className="o-layout__item c-header__nav-tool u-3/10 right">
          <a
            href="/"
            className="u-margin-horizontal-tiny"
            data-display="inline-flex"
            data-hover="darkblue"
          >
            <FontAwesomeIcon icon="globe" className="large"/>
            <span className="c-header__nav-tool-text">English</span>
          </a>
          <a
            href="/"
            className="u-margin-horizontal-tiny"
            data-display="inline-flex"
            data-hover="darkblue"
          >
            <FontAwesomeIcon icon="user" className="large"/>
            <span className="c-header__nav-tool-text">
              <span>
                Hello,
                <span
                  className="u-txt--bold"
                >
                  Karl Max
                </span>
              </span>
              <br/>
              Account Settings
            </span>
          </a>
          <a
            href="/"
            className="c-header__cart"
            data-display="inline-flex"
            data-hover="darkblue"
          >
            <FontAwesomeIcon icon="shopping-cart" className="large"/>
            {/* <span class="c-header__cart-counter">1</span> */}

            <span className="c-header__nav-tool-text">
                Cart
              <span className="u-txt--bold">
                  1
              </span>
            </span>
          </a>


        </div>
      </div>


    </header>
  </Router>
);

export default Header;
