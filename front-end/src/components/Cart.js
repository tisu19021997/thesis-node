import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useCookies, Cookies, withCookies } from 'react-cookie';

class Cart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
    };
  }

  componentDidMount() {
    const { cookies, onInitCart } = this.props;
    const username = cookies.get('user');
    const loggedIn = !!username;

    // if the user is logged-in, get the cart object from server
    if (loggedIn) {
      axios.get(`/user/${username}/cart`)
        .then((res) => {
          const { cart } = res.data;

          this.setState({
            products: cart || [],
          });

          onInitCart(cart);
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } else {
      const cart = cookies.get('cart');
      if (cart) {
        this.setState({
          products: cart,
        });
      }
    }
  }

  render() {
    return null;
  }
}

Cart.propTypes = {
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

export default withCookies(Cart);
