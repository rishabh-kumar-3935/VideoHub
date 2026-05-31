import { createStore, combineReducers } from 'redux';
import authReducer from './authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
});

const store = createStore(rootReducer);

export { store };
