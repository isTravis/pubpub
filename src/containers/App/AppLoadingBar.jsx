// Originally taken from https://github.com/lonelyclick/react-loading-bar
// Forked to add auto-incrementing feature and to consolidate CSS
import React, { PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';

let styles = {};
let interval = undefined;

export const AppLoadingBar = React.createClass({
	propTypes: {
		color: PropTypes.string,
		show: PropTypes.bool
	},

	getDefaultProps() {
		return {
			color: '#BBBDC0',
			show: false,
		};
	},

	getInitialState() {
		return {
			disappearDelayHide: false, // when dispappear, first transition then display none
			percent: 0,
		};
	},

	componentWillReceiveProps(nextProps) {
		if (!this.props.show && nextProps.show) {
			this.show();
			interval = setInterval(this.show, 200);
		} 
		if (this.props.show && !nextProps.show) {
			this.hide();
			clearInterval(interval);
		}
	},

	shouldComponentUpdate(nextProps, nextState) {
		return shallowCompare(this, nextProps, nextState);
	},

	show() {
		let { percent } = this.state;
		percent = this.calculatePercent(percent);
		this.setState({
			percent
		});
	},

	hide() {
		this.setState({
			disappearDelayHide: true,
			percent: 1
		});

		setTimeout(() => {
			this.setState({
				disappearDelayHide: false,
				percent: 0
			});
		}, 600);
	},

	getBarStyle() {
		const { disappearDelayHide, percent } = this.state;
		const { color } = this.props;

		return {
			...styles.bar,
			background: color,
			transform: `translate3d(calc(-100% + ${percent * 100}%), 0, 0)`,
			display: disappearDelayHide || percent > 0 ? 'block' : 'none',
			opacity: disappearDelayHide ? 0 : 1,
		};
	},

	
	calculatePercent(percent) {
		let currentPercent = percent || 0;
		let random = 0;

		if (currentPercent < 0.25) {
			random = (Math.random() * (5 - 3 + 1) + 10) / 100;
		} else if (currentPercent >= 0.25 && currentPercent < 0.65) {
			random = (Math.random() * 3) / 100;
		} else if (currentPercent >= 0.65 && currentPercent < 0.9) {
			random = (Math.random() * 2) / 100;
		} else if (currentPercent >= 0.9 && currentPercent < 0.99) {
			random = 0.005;
		} else {
			random = 0;
		}

		currentPercent += random;
		return currentPercent;
	},

	render() {
		return (
			<div style={styles.loading}>
				<div style={this.getBarStyle()}>
					<div style={styles.peg}></div>
				</div>
			</div>
		);
	}
});

export default AppLoadingBar;

styles = {
	loading: {
		pointerEvents: 'none',
		// transition: '400ms linear all'
	},
	bar: {
		position: 'fixed',
		top: 0,
		left: 0,
		zIndex: 10002,
		display: 'none',
		width: '100%',
		height: '2px',
		borderRadius: '0 1px 1px 0',
		transition: 'transform 350ms, opacity 250ms linear 350ms',
	},
	peg: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: '70px',
		height: '2px',
		borderRadius: '50%',
		opacity: 0.45,
		boxShadow: '#777 1px 0 6px 1px',
	}
};
