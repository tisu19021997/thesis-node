import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Breadcrumb = (props) => {
  const { breadcrumbItems } = props;
  const itemList = breadcrumbItems[0];
  const breadcrumbDOM = itemList.map((item, index) => (
    <span key={index.toString()} className="c-breadcrumb__child" data-hover="darkblue">
        <Link
          to={`/category/${index}`}
        >
          {item}
        </Link>
      </span>
  ));

  return (
    <div className="c-breadcrumb">
      {breadcrumbDOM}
    </div>
  );
};

Breadcrumb.propTypes = {
  breadcrumbItems: PropTypes.array.isRequired,
};

export default Breadcrumb;
