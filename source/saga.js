import { FileSystem } from 'expo';
import sha256 from 'crypto-js/sha256';
import { put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { actions, constants } from './reducer';

export const resolveFilename = (uri) => sha256(uri).toString();

export const defaultConfig = {
  folderName: 'expo-image-cache',
  reducerName: 'imageCache',
  resolveFilename,
};

export const getLoading = (config) => (state) =>
  state[config.reducerName].loading;

export default (givenConfig = {}) => {
  const config = Object.assign({}, defaultConfig, givenConfig);
  const folder = FileSystem.cacheDirectory + config.folderName;

  const getLoadingInstance = getLoading(config);

  const resolve = function* ({ payload }) {
    const loading = yield select(getLoadingInstance);
    if (loading.includes(payload.uri)) return;
    const filename = config.resolveFilename(payload);
    const file = `${folder}/${filename}`;
    const localFile = yield FileSystem.getInfoAsync(file);
    if (localFile.exists) {
      yield put(actions.downloadSuccess({
        uri: payload.uri,
        local: localFile.uri,
      }));
      return;
    }
    yield put(actions.download(payload.uri));
    try {
      const downloaded = yield FileSystem.downloadAsync(payload.uri, file);
      yield put(actions.downloadSuccess({
        uri: payload.uri,
        local: downloaded.uri,
      }));
    } catch (error) {
      yield put(actions.downloadError(error));
    }
  };

  const resolveSaga = function* () {
    yield takeEvery(constants.resolve, resolve);
  };

  const init = function* () {
    const folderInfo = yield FileSystem.getInfoAsync(folder);
    if (folderInfo.exists) return;
    try {
      yield FileSystem.makeDirectoryAsync(folder);
      yield put(actions.initSuccess());
    } catch (error) {
      yield put(actions.initError(error));
    }
  };

  const initSaga = function* () {
    yield takeLatest(constants.init, init);
  };

  return {
    config,
    folder,
    getLoading: getLoadingInstance,
    init,
    initSaga,
    resolve,
    resolveSaga,
  };
};
