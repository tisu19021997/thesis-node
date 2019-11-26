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
} from '@fortawesome/free-solid-svg-icons';

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
  render() {
    return (
      <Router>
        <div className="App">

          <Header useCategoryList />

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

export default App;
