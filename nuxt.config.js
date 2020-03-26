import ConfigWebpackPlugin from 'config-webpack';

export default {
	head: {
		title: 'XRChat',
        description: 'Anyone, anywhere, on any device',
    },
    
    css: [
		{
			src: '@/assets/scss/site.scss',
			lang: 'scss'
		}
    ],

    styleResources: {
		scss: [
			'components/**/*.scss',
		]
	},
    
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
    ],
}