// Minimal placeholder store to satisfy `react-redux` Provider during development.
// Replace this with a proper Redux store implementation when available.
const store = {
	getState: () => ({}),
	dispatch: () => ({}),
	subscribe: () => () => {},
};

export { store };
