import React from 'react';
import PropTypes from 'prop-types';

const Section = (props) => {
  const {
    className, data, title, titleClass, contentClass, children,
  } = props;

  return (
    <section className={`c-section ${className}`} data-section={data}>

      <div className={`c-section__title ${titleClass}`}>
        {title}
      </div>

      <div className={`c-section__content ${contentClass}`}>
        {children}
      </div>

    </section>
  );
};

Section.propTypes = {
  className: PropTypes.string,
  data: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleClass: PropTypes.string,
  contentClass: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Section.defaultProps = {
  className: '',
  data: 'Default Section Data',
  titleClass: '',
  contentClass: '',
};

export default Section;
