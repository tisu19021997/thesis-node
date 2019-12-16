import React from 'react';
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
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './context/user';
import local from './helper/localStorage';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/page/Home';
import ProductDetail from './components/page/ProductDetail';
import ProductSearch from './components/page/ProductSearch';


// create font-awesome icons library
library.add(fab, faSearch, faGlobe, faUser, faShoppingCart, faAngleLeft, faAngleRight, faApple,
  faBasketballBall, faTshirt, faCameraRetro, faLaptopCode, faHeadphonesAlt, faTv, faTrain, faTimes,
  faChevronRight, faChevronLeft);

// axios default configurations
axios.defaults.baseURL = process.env.REACT_APP_SERVER_HOST || 'http://localhost:8081';


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: local.get('user') || '',
      token: local.get('token') || '',
      cart: [],
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    this.updateCart = this.updateCart.bind(this);
    this.bundlePurchase = this.bundlePurchase.bind(this);
  }

  login(user, token) {
    this.setState({
      currentUser: user,
      token,
    });
    local.save('user', user);
    local.save('token', token);
  }

  logout() {
    this.setState({
      currentUser: '',
      token: '',
    });
    local.remove('user');
    local.remove('token');
  }

  updateCart(cart) {
    this.setState({
      cart,
    });
  }

  bundlePurchase(products) {
    this.setState({
      cart: products,
    });
  }

  render() {
    const { currentUser, token, cart } = this.state;

    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    return (
      <UserContext.Provider value={{
        currentUser,
        token,
      }}>
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

              <Route
                exact
                path="/"
                render={(props) => (
                  <Home {...props} currentUser={currentUser} />
                )}
              />

              <Route
                path="/products/search"
                exact
                render={(props) => (
                  <ProductSearch
                    {...props}
                  />
                )}
              />

              <Route
                path="/products/:asin"
                render={(props) => (
                  <ProductDetail
                    {...props}
                    loggedIn={currentUser !== ''}
                    currentUser={currentUser}
                    updateCart={this.updateCart}
                    onBundlePurchase={this.bundlePurchase}
                    shoppingCart={cart}
                  />
                )}
              />
            </Switch>

            <Footer />


          </div>
        </Router>
      </UserContext.Provider>
    );
  }
}
