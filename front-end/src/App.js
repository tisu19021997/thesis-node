import React from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab, faApple } from '@fortawesome/free-brands-svg-icons';
import {
  faSearch,
  faGlobe,
  faUser,
  faShoppingCart,
  faAngleLeft,
  faAngleRight,
  faBasketballBall,
  faTshirt,
  faCameraRetro,
  faLaptopCode,
  faHeadphonesAlt,
  faTv,
  faTrain,
} from '@fortawesome/free-solid-svg-icons';

import { withCookies, Cookies } from 'react-cookie';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/page/Home';
import ProductDetail from './components/page/ProductDetail';

const axios = require('axios');

// Add a Font-Awesome library
library.add(fab, faSearch, faGlobe, faUser, faShoppingCart, faAngleLeft, faAngleRight, faApple,
  faBasketballBall, faTshirt, faCameraRetro, faLaptopCode, faHeadphonesAlt, faTv, faTrain);

// Axios defaults
axios.defaults.baseURL = process.env.REACT_APP_SERVER_HOST || 'http://localhost:8081';

class App extends React.Component {
  constructor(props) {
    super(props);

    const { cookies } = props;
    this.state = {
      currentUser: cookies.get('user') || '',
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login(user) {
    const { cookies } = this.props;

    this.setState({
      currentUser: user,
    });
    cookies.set('user', user);
  }

  logout() {
    const { cookies } = this.props;

    this.setState({
      currentUser: '',
    });
    cookies.set('user', '');
  }

  render() {
    const { currentUser } = this.state;

    return (
      <Router>
        <div className="App">

          <Header
            currentUser={currentUser}
            login={this.login}
            logout={this.logout}
            useCategoryList
          />

          <Switch>

            <Route exact path="/" component={Home} />

            <Route path="/product/:asin" component={ProductDetail} />

          </Switch>

          <Footer />


        </div>
      </Router>
    );
  }
}

App.propTypes = {
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

export default withCookies(App);
