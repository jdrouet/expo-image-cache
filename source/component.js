import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Image } from 'react-native';
import { actions } from './reducer';

class SmartImage extends React.Component {
  static propTypes = {
    component: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    source: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        uri: PropTypes.string.isRequired,
      }),
    ]).isRequired,
    imageCacheAction: PropTypes.shape({
      resolve: PropTypes.func.isRequired,
    }).isRequired,
    file: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    remote: PropTypes.bool.isRequired,
    renderLoading: PropTypes.func,
  };

  static defaultProps = {
    component: Image,
    file: null,
    renderLoading: null,
  };

  componentWillMount() {
    if (this.props.remote) {
      this.props.imageCacheAction.resolve(this.props.source);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.remote
      && this.props.file !== nextProps.file
    ) || (
      this.props.source !== nextProps.source
    );
  }

  getSource() {
    if (!this.props.remote || this.props.loading) return this.props.source;
    return { uri: this.props.file };
  }

  render() {
    if (this.props.loading && this.props.renderLoading) {
      return this.props.renderLoading(this.props);
    }
    const Component = this.props.component;
    const source = this.getSource();
    return (
      <Component
        {...this.props}
        source={source}
      />
    );
  }
}

export const Component = SmartImage;

export const isRemote = (props) =>
  !!props.source && !!props.source.uri;

// TODO find a way to modify the reducer location
export const isLoading = (state, params) => {
  if (!isRemote(params)) return false;
  const list = state.imageCache.downloading;
  return list.includes(params.source.uri);
};

export const getFile = (state, params) => {
  if (!isRemote(params) || isLoading(state, params)) return null;
  return state.imageCache.downloaded[params.source.uri];
};

export const paramsToProps = (state, params) => ({
  remote: isRemote(params),
  loading: isLoading(state, params),
  file: getFile(state, params),
});

export const bindActionsToProps = (dispatch) => ({
  imageCacheAction: bindActionCreators(actions, dispatch),
});

export default connect(
  paramsToProps,
  bindActionsToProps,
)(SmartImage);
