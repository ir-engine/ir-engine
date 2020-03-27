import ConfigWebpackPlugin from 'config-webpack'

export default {
	head: {
		title: 'XRChat',
        description: 'Anyone, anywhere, on any device',
    },

	buildModules: ['@nuxt/typescript-build'],
    
	build: {
        babel: {
			presets: ['@babel/preset-env'],
			plugins: [
				'@babel/transform-runtime'
			],
			babelrc: true
        },
        plugins: [
			new ConfigWebpackPlugin(),
		],
    },

    plugins: [
		{
			src: './plugins/vue-aframe',
			mode: 'client'
		}
    ]
}