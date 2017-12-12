import { createAction, handleActions } from 'redux-actions';

export const constants = {
  init: 'expo-image-cache.init',
  initSuccess: 'expo-image-cache.init-success',
  initError: 'expo-image-cache.init-error',
  resolve: 'expo-image-cache.resolve',
  download: 'expo-image-cache.download',
  downloadSuccess: 'expo-image-cache.download-success',
  downloadError: 'expo-image-cache.download-error',
};

export const actions = Object
  .keys(constants)
  .reduce((res, key) => Object.assign(res, {
    [key]: createAction(constants[key]),
  }), {});

export const initState = {
  initializing: false,
  initialized: false,
  downloading: [],
  downloaded: {},
};

export default handleActions({
  [constants.init]: (state) => ({
    ...state,
    initializing: true,
  }),
  [constants.initSuccess]: (state) => ({
    ...state,
    initializing: false,
    initialized: true,
  }),
  [constants.initError]: (state) => ({
    ...state,
    initializing: false,
    initialized: false,
  }),
  [constants.download]: (state, { payload }) => ({
    ...state,
    downloading: [
      ...state.downloading,
      payload.uri,
    ],
  }),
  [constants.downloadSuccess]: (state, { payload }) => {
    const downloading = state.downloading.filter((uri) => uri !== payload.uri);
    const downloaded = {
      ...state.downloaded,
      [payload.uri]: payload.local,
    };
    return {
      ...state,
      downloading,
      downloaded,
    };
  },
  [constants.downloadError]: (state, { payload }) => {
    const downloading = state.downloading.filter((uri) => uri !== payload.uri);
    return {
      ...state,
      downloading,
    };
  },
}, initState);
