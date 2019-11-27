import React from 'react';
import Wrapper from '../Wrapper';
import Section from '../Section';
import Product from '../Product';
import SlickSlider from '../slider/SlickSlider';
import PrevArrow from '../slider/PrevArrow';
import NextArrow from '../slider/NextArrow';

const axios = require('axios');

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      products: {
        history: [],
      },
    };
  }

  componentDidMount() {
    axios.get('/')
      .then((res) => {
        const { products } = res.data;

        this.setState({
          products: {
            history: products,
          },
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  render() {
    const { products } = this.state;
    const { history } = products;

    const historyProducts = history.map((product) => (
      <Product
        key={product.asin}
        product={product}
      />
    ));

    return (
      <Wrapper className="u-ph-0">
        <Section title="Pick up where you left off" data="History">

          <SlickSlider
            settings={
              {
                slidesToShow: 4,
                slidesToScroll: 4,
                adaptiveHeight: false,
                dots: true,
                dotsClass: 'c-section__dots slick-dots',
                arrows: true,
                prevArrow: <PrevArrow />,
                nextArrow: <NextArrow />,
                responsive: [
                  {
                    breakpoint: 980,
                    settings: {
                      slidesToShow: 2.5,
                      slidesToScroll: 2.5,
                      dots: false,
                      arrows: false,
                    },
                  },
                ],
              }
            }
            className="c-slider [  c-slider--tiny-gut c-slider--right-dots ] u-ph-48"
          >
            {historyProducts}
          </SlickSlider>

        </Section>
      </Wrapper>
    );
  }
}

export default Home;
