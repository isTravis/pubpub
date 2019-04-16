/* eslint-disable no-param-reassign */
const { resolve } = require('path');
const autoprefixer = require('autoprefixer');

module.exports = ({ config }) => {
	config.module.rules.push({
		test: /\.scss$/,
		use: [
			{ loader: 'style-loader' }, // creates style nodes from JS strings
			{ loader: 'css-loader' }, // translates CSS into CommonJS
			{
				loader: 'postcss-loader',
				options: { ident: 'postcss', plugins: [autoprefixer({})] },
			},
			{ loader: 'sass-loader', options: { includePaths: [resolve(__dirname, '../client')] } }, // compiles Sass to CSS
		],
	});
	config.module.rules.push({
		test: /\.(ttf|eot|svg|woff|woff2)$/,
		use: [
			{ loader: 'file-loader', query: { name: 'fonts/[hash].[ext]', publicPath: '/dist/' } },
		],
	});

	config.resolve.modules = [resolve(__dirname, '../client'), 'node_modules'];
	config.resolve.alias['shared'] = resolve(__dirname, '../shared');
	return config;
};
