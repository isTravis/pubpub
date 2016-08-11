import Immutable from 'immutable';
import {ensureImmutable} from 'reducers';

/*--------*/
// Load Actions
/*--------*/
import {
	SIGNUP_LOAD,
	SIGNUP_SUCCESS,
	SIGNUP_FAIL,

	SIGNUP_DETAILS_LOAD,
	SIGNUP_DETAILS_SUCCESS,
	SIGNUP_DETAILS_FAIL,

} from './actions';

/*--------*/
// Initialize Default State
/*--------*/
export const defaultState = Immutable.Map({
	currentStage: 'signup',
	loading: false,
	error: undefined
});

/*--------*/
// Define reducing functions
//
// These functions take in an initial state and return a new
// state. They are pure functions. We use Immutable to enforce this.
/*--------*/
function signupLoading(state) {
	return state.merge({
		loading: true,
		error: undefined,
		currentStage: 'signup',
	});
}

function signupSuccess(state) {
	return state.merge({
		loading: false,
		error: undefined,
		currentStage: 'details',
	});
}

function signupFailed(state, error) {
	return state.merge({
		loading: false,
		error: error
	});
}

function detailsLoading(state) {
	return state.merge({
		loading: true,
		error: undefined,
		currentStage: 'details',
	});
}

function detailsSuccess(state) {
	return state.merge({
		loading: false,
		error: undefined,
		currentStage: 'complete',
	});
}

function detailsFailed(state, error) {
	return state.merge({
		loading: false,
		error: error
	});
}


/*--------*/
// Bind actions to specific reducing functions.
/*--------*/
export default function reducer(state = defaultState, action) {

	switch (action.type) {
	case SIGNUP_LOAD:
		return signupLoading(state);
	case SIGNUP_SUCCESS:
		return signupSuccess(state);
	case SIGNUP_FAIL:
		return signupFailed(state, action.error);

	case SIGNUP_DETAILS_LOAD:
		return detailsLoading(state);
	case SIGNUP_DETAILS_SUCCESS:
		return detailsSuccess(state);
	case SIGNUP_DETAILS_FAIL:
		return detailsFailed(state, action.error);

	default:
		return ensureImmutable(state);
	}
}
