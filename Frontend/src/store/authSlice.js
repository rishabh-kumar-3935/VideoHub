// Simple auth action creators and reducer for Redux state.

export const login = (user) => ({
  type: 'auth/login',
  payload: user,
});

export const logout = () => ({
  type: 'auth/logout',
});

const initialState = {
  status: false,
  userData: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'auth/login':
      return {
        ...state,
        status: true,
        userData: action.payload,
      };
    case 'auth/logout':
      return {
        ...state,
        status: false,
        userData: null,
      };
    default:
      return state;
  }
}
