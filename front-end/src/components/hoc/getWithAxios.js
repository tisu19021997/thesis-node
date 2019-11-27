import React from 'react';

const axios = require('axios');

export default function getWithAxios(WrappedComponent, endpoint, params) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        data: {},
      };
    }

    componentDidMount() {
      axios.get(endpoint, params)
        .then((res) => {
          const { data } = res;

          this.setState({
            data,
          });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    }

    render() {
      const { data } = this.state;
      // ... and renders the wrapped component with the fresh data!
      // Notice that we pass through any additional props
      return <WrappedComponent data={data} {...this.props} />;
    }
  };
}
