import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';

class ProductZoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nav1: null,
      nav2: null,
      screenSettings: {
        arrows: false,
        dots: false,
        infinite: true, // fix first slide doesn't work with asNavFor
      },
      navSettings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        infinite: true, // fix first slide doesn't work with asNavFor
      },
    };
  }

  componentDidMount() {
    this.setState({
      nav1: this.slider1,
      nav2: this.slider2,
    });
  }

  render() {
    const { screenSettings, navSettings } = this.state;
    const { productImages } = this.props;

    const imagesDOM = productImages.map((imgUrl, index) => (
      <React.Fragment key={index.toString()}>
        <div
          className="c-slider__item"
        >
          <img src={imgUrl} alt="Product" />
        </div>
      </React.Fragment>
    ));

    return (
      <div className="c-slider">

        <Slider
          {...screenSettings}
          className="c-slider__screen c-slider__w-img"
          asNavFor={this.state.nav2}
          ref={(slider) => (this.slider1 = slider)}
        >
          {imagesDOM}
        </Slider>

        <Slider
          {...navSettings}
          className="c-slider__nav c-slider__w-img"
          asNavFor={this.state.nav1}
          ref={(slider) => (this.slider2 = slider)}
          swipeToSlide
          focusOnSelect
        >
          {imagesDOM}
        </Slider>

      </div>
    );
  }
}

ProductZoom.propsType = {
  productImages: PropTypes.array.isRequired,
};

export default ProductZoom;
