import { FileSystem } from 'expo';
import { put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as saga from '../source/saga';
import { actions } from '../source/reducer';

const generate = saga.default;

describe('saga generator', () => {
  describe('default configuration', () => {
    it('should return the folder in which the images are stored', () => {
      const saga = generate({});
      expect(saga.folder).toEqual('file://MOCK/expo-image-cache');
    });
    
    it('should return the folder in which the images are stored', () => {
      const saga = generate();
      expect(saga.folder).toEqual('file://MOCK/expo-image-cache');
    });
  });

  describe('custom configuration', () => {
    const saga = generate({
      folderName: 'toto',
    });

    it('should return the folder in which the images are stored', () => {
      expect(saga.folder).toEqual('file://MOCK/toto');
    });
  });

  describe('initSaga function', () => {
    const saga = generate({});

    it('should call the init function', () => {
      const action = actions.init();
      const generator = saga.initSaga(action);
      const value = generator.next().value;
      expect(value).toEqual(takeLatest(action.type, saga.init));
    });
  });

  describe('init function', () => {
    const saga = generate({});

    it('should return if the folder exists', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({ exists: true }))
      const action = actions.init();
      const generator = saga.init(action);
      let value = generator.next().value;
      expect(value).toEqual({ exists: true });
      expect(FileSystem.getInfoAsync.mock.calls).toHaveLength(1);
      expect(generator.next(value).done).toEqual(true);
    });

    it('should create the folder', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({ exists: false }));
      FileSystem.makeDirectoryAsync = jest.fn();
      const action = actions.init();
      const generator = saga.init(action);
      let value = generator.next().value;
      expect(value).toEqual({ exists: false });
      expect(FileSystem.getInfoAsync.mock.calls).toHaveLength(1);
      value = generator.next(value).value;
      expect(FileSystem.makeDirectoryAsync.mock.calls).toHaveLength(1);
      value = generator.next(value).value;
      expect(value).toEqual(put(actions.initSuccess()));
    });

    it('should throw an exception', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({ exists: false }));
      const error = new Error('oups');
      FileSystem.makeDirectoryAsync = jest.fn(() => {
        throw error;
      });
      const action = actions.init();
      const generator = saga.init(action);
      let value = generator.next().value;
      expect(value).toEqual({ exists: false });
      expect(FileSystem.getInfoAsync.mock.calls).toHaveLength(1);
      value = generator.next(value).value;
      expect(value).toEqual(put(actions.initError(error)));
    });
  });

  describe('resolveSaga function', () => {
    const saga = generate({});

    it('should call the resolve function', () => {
      const action = actions.resolve({ uri: 'google.com' });
      const generator = saga.resolveSaga(action);
      const value = generator.next().value;
      expect(value).toEqual(takeEvery(action.type, saga.resolve));
    });
  });

  describe('resolve function', () => {
    const saga = generate({});

    it('should return if already loaded', () => {
      const uri = 'http://foo.bar/image.png';
      const action = actions.resolve({ uri });
      const generator = saga.resolve(action);
      let value = generator.next().value;
      expect(value).toEqual(select(saga.getLoading));
      expect(generator.next([ uri ]).done).toEqual(true);
    });

    it('should load from the fs', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({
        exists: true,
        uri: 'file://MOCK/toto/image.png',
      }));
      const uri = 'http://foo.bar/image.png';
      const action = actions.resolve({ uri });
      const generator = saga.resolve(action);
      let res = generator.next();
      expect(res.value).toEqual(select(saga.getLoading));
      res = generator.next([]);
      expect(res.value.exists).toEqual(true);
      res = generator.next(res.value);
      expect(res.value).toEqual(put(actions.downloadSuccess({
        uri,
        local: 'file://MOCK/toto/image.png',
      })));
      res = generator.next(res.value);
      expect(res.done).toEqual(true);
    });

    it('should download the image', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({ exists: false }));
      FileSystem.downloadAsync = jest.fn(() => ({ uri: 'file://MOCK/toto/image.png' }));
      const uri = 'http://foo.bar/image.png';
      const action = actions.resolve({ uri });
      const generator = saga.resolve(action);
      let res = generator.next();
      expect(res.value).toEqual(select(saga.getLoading));
      res = generator.next([]);
      expect(res.value.exists).toEqual(false);
      res = generator.next(res.value);
      expect(res.value).toEqual(put(actions.download(uri)));
      res = generator.next(res.value);
      const local = res.value.uri;
      res = generator.next(res.value);
      expect(res.value).toEqual(put(actions.downloadSuccess({
        uri,
        local,
      })));
      res = generator.next(res.value);
      expect(res.done).toEqual(true);
    });

    it('should throw an error', () => {
      FileSystem.getInfoAsync = jest.fn(() => ({ exists: false }));
      const error = new Error('oops');
      FileSystem.downloadAsync = jest.fn(() => {
        throw error;
      });
      const uri = 'http://foo.bar/image.png';
      const action = actions.resolve({ uri });
      const generator = saga.resolve(action);
      let res = generator.next();
      expect(res.value).toEqual(select(saga.getLoading));
      res = generator.next([]);
      expect(res.value.exists).toEqual(false);
      res = generator.next(res.value);
      expect(res.value).toEqual(put(actions.download(uri)));
      res = generator.next(res.value);
      expect(res.value).toEqual(put(actions.downloadError(error)));
      res = generator.next(res.value);
      expect(res.done).toEqual(true);
    });
  });

  describe('getLoading function', () => {
    it('should return the state', () => {
      const saga = generate({});
      expect(saga.getLoading({
        imageCache: {
          loading: 42,
        },
      })).toEqual(42);
    });

    it('should return the state with a custom route', () => {
      const saga = generate({
        reducerName: 'toto',
      });
      expect(saga.getLoading({
        toto: {
          loading: 42,
        },
      })).toEqual(42);
    });
  });
});
