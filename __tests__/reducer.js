import * as reducer from '../source/reducer';

const reduce = reducer.default;

describe('reducer', () => {
  it('should contain constants', () => {
    expect(reducer.constants).toHaveProperty('init');
    expect(reducer.constants).toHaveProperty('initSuccess');
    expect(reducer.constants).toHaveProperty('initError');
    expect(reducer.constants).toHaveProperty('resolve');
    expect(reducer.constants).toHaveProperty('download');
    expect(reducer.constants).toHaveProperty('downloadSuccess');
    expect(reducer.constants).toHaveProperty('downloadError');
  });

  it('should actions constants', () => {
    expect(reducer.actions).toHaveProperty('init');
    expect(reducer.actions).toHaveProperty('initSuccess');
    expect(reducer.actions).toHaveProperty('initError');
    expect(reducer.actions).toHaveProperty('resolve');
    expect(reducer.actions).toHaveProperty('download');
    expect(reducer.actions).toHaveProperty('downloadSuccess');
    expect(reducer.actions).toHaveProperty('downloadError');
  });

  describe('reduction', () => {
    [
      {
        state: reducer.initState,
        action: reducer.actions.init(),
        result: {
          ...reducer.initState,
          initializing: true,
        },
      },
      {
        state: reducer.initState,
        action: reducer.actions.initSuccess(),
        result: {
          ...reducer.initState,
          initialized: true,
        },
      },
      {
        state: {
          ...reducer.initState,
          initializing: true,
        },
        action: reducer.actions.initError(),
        result: reducer.initState,
      },
      {
        state: reducer.initState,
        action: reducer.actions.download({ uri: 'an-url' }),
        result: {
          ...reducer.initState,
          downloading: ['an-url'],
        },
      },
      {
        state: reducer.initState,
        action: reducer.actions.downloadSuccess({
          uri: 'an-url',
          local: 'somewhere',
        }),
        result: {
          ...reducer.initState,
          downloaded: {
            'an-url': 'somewhere',
          },
        },
      },
      {
        state: {
          ...reducer.initState,
          downloading: ['an-url'],
        },
        action: reducer.actions.downloadSuccess({
          uri: 'an-url',
          local: 'somewhere',
        }),
        result: {
          ...reducer.initState,
          downloaded: {
            'an-url': 'somewhere',
          },
        },
      },
      {
        state: reducer.initState,
        action: reducer.actions.downloadError({
          uri: 'an-url',
        }),
        result: reducer.initState,
      },
      {
        state: {
          ...reducer.initState,
          downloading: ['an-url'],
        },
        action: reducer.actions.downloadError({
          uri: 'an-url',
        }),
        result: reducer.initState,
      },
    ].forEach((item) => {
      it('should reduce', () => {
        const action = reducer.actions.init();
        const state = reducer.initState;
        expect(reduce(item.state, item.action)).toEqual(item.result);
      });
    })
  });
});
