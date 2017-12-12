import 'react-native';
import React from 'react';
import { Component, getFile, isLoading, isRemote } from '../source/component';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { actions } from '../source/reducer';

const uri = 'http://foo.bar/image.png';

describe('component', () => {
  describe('getFile', () => {
    it('should detect local files', () => {
      expect(isRemote({source: {uri}})).toEqual(true);
    })
  });

  describe('isLoading', () => {
    it('should return true', () => {
      expect(isLoading({
        imageCache: {
          downloading: [uri],
        },
      }, {
        source: {uri},
      })).toEqual(true);
    })

    it('should return false', () => {
      expect(isLoading({
        imageCache: {
          downloading: [],
        },
      }, {
        source: {uri},
      })).toEqual(false);
    })
  });

  describe('getFile', () => {
    it('should detect local files', () => {
      expect(getFile({
        imageCache: {
          downloading: [],
          downloaded: {
            [uri]: 'here',
          },
        },
      }, {
        source: {uri},
      })).toEqual('here');
    })
  });

  describe('render', () => {
    it('should render the remote file', () => {
      const tree = renderer.create(
        <Component
          imageCacheAction={actions}
          loading={false}
          remote={false}
          source={4}
        />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render the loading function', () => {
      const renderLoading = () => null;
      const source = {uri};
      const tree = renderer.create(
        <Component
          imageCacheAction={actions}
          loading={true}
          remote={true}
          source={source}
          renderLoading={renderLoading}
        />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render the image even if loading', () => {
      const source = {uri};
      const tree = renderer.create(
        <Component
          imageCacheAction={actions}
          loading={true}
          remote={true}
          source={source}
        />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render the local file', () => {
      const source = {uri};
      const file = 'file://local/image.png';
      const tree = renderer.create(
        <Component
          imageCacheAction={actions}
          loading={false}
          remote={true}
          source={source}
          file={file}
        />
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
