import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Cookies, withCookies } from 'react-cookie';

class Cart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
    };
  }
  render() {
    return null;
  }
}

Cart.propTypes = {
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

export default withCookies(Cart);
