module.exports = {
	presets: ['@babel/preset-env', '@babel/preset-react'],
	plugins: ['@babel/plugin-transform-runtime'],
	env: {
		test: {
			plugins: ['macros', 'require-context-hook', '@babel/plugin-proposal-class-properties'],
		},
	},
};
