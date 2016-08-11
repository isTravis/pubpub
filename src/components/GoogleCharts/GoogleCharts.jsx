/* global google */
import React, {PropTypes} from 'react';
import Radium from 'radium';

// Data should be an array of pairs
// gChartProps are settings for this chart

export const GoogleCharts = React.createClass({
	propTypes: {
		options: PropTypes.object,
		rows: PropTypes.array,
		columns: PropTypes.array,
		chartType: PropTypes.string,
		graph_id: PropTypes.string,
		width: PropTypes.string,
		height: PropTypes.string,
		legend_toggle: PropTypes.bool,
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.drawCharts();
	},

	componentDidUpdate() {
		this.drawCharts();
	},

	render: function() {
		return React.DOM.div({id: this.props.graph_id,
			style: {height: this.props.height,
				width: this.props.width}});
	},
	drawCharts: function() {
		if (!google.visualization) {
			document.getElementById(this.props.graph_id).innerHTML = '<span>Googe Charts is Loading...</span>';
			return undefined;
		}
		const dt = new google.visualization.DataTable({
			cols: this.props.columns
		});
		dt.addRows(this.props.rows);

		const opt = this.props.options;

		const chart = new google.visualization[this.props.chartType](
			document.getElementById(this.props.graph_id)
		);

		chart.draw(dt, opt);
	}
});

export default Radium(GoogleCharts);
