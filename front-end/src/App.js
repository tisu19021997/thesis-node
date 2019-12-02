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
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { withCookies, Cookies } from 'react-cookie';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/page/Home';
import ProductDetail from './components/page/ProductDetail';


// Add a Font-Awesome library
library.add(fab, faSearch, faGlobe, faUser, faShoppingCart, faAngleLeft, faAngleRight, faApple,
  faBasketballBall, faTshirt, faCameraRetro, faLaptopCode, faHeadphonesAlt, faTv, faTrain, faTimes);

// Axios defaults
axios.defaults.baseURL = process.env.REACT_APP_SERVER_HOST || 'http://localhost:8081';

class App extends React.Component {
  constructor(props) {
    super(props);

    const { cookies } = props;
    this.state = {
      currentUser: cookies.get('user') || null,
      cart: [],
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    this.updateCart = this.updateCart.bind(this);
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

  updateCart(cart) {
    this.setState({
      cart,
    });
  }

  render() {
    const { currentUser, cart } = this.state;

    return (
      <Router>
        <div className="App">

          <Header
            currentUser={currentUser}
            login={this.login}
            logout={this.logout}
            cart={cart}
            updateCart={this.updateCart}
          />

          <Switch>

            <Route exact path="/" component={Home} />

            <Route
              path="/product/:asin"
              render={(props) => (
                <ProductDetail
                  {...props}
                  loggedIn={currentUser !== null}
                  currentUser={currentUser}
                  updateCart={this.updateCart}
                  deleteCartItem={this.deleteCartItem}
                  onPurchase={this.purchase}
                  shoppingCart={cart}
                />
              )}
            />

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
