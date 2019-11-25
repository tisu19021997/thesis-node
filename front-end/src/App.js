import React from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faSearch, faGlobe, faUser, faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';

import axiosInstance from './helper/axios';
import Header from './components/Header';
import SlickSlider from './components/SlickSlider';

// Add a Font-Awesome library
library.add(fab, faSearch, faGlobe, faUser, faShoppingCart);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
    };

  }

  componentDidMount() {
    axiosInstance.get('/')
      .then((res) => {
        const { products } = res.data;

        this.setState({
          products,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }


  render() {
    const { products } = this.state;

    const productList = products.map((product) => (
      <div
        className="c-product"
      >
        <div className="c-product__img">
          <img src={product.imUrl} />
        </div>
      </div>
    ));

    console.log(this.settings);
    return (

      // eslint-disable-next-line react/jsx-filename-extension
      <div className="App ">
        <Header />

        <SlickSlider settings={
          {
            slidesToShow: 2.5,
            slidesToScroll: 2.5,
            infinite: false,
            mobileFirst: true,
            draggable: true,
            lazyLoad: 'ondemand',
            dots: false,
            arrows: false,
            responsive: [
              {
                breakpoint: 980,
                settings: {
                  slidesToShow: 4,
                  slidesToScroll: 4,
                  dots: true,
                  arrows: true,
                  prevArrow: '<button type="button" class="left"><i class="fas fa-angle-left [ large ]"></i></button>',
                  nextArrow: '<button type="button" class="right"><i class="fas fa-angle-right [ large ]"></i></button>',
                  dotsClass: 'c-section__dots slick-dots',
                },
              },
            ],
          }
        }
          class="c-section__content c-slider [ c-slider--tiny-gut c-slider--right-dots ] u-ph-48"
        >
          {productList}
        </SlickSlider>

      </div>
    );
  }
}

export default App;
