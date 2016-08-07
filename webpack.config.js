module.exports = {
  entry: './src/index.js',
  output: {
    path: '.',
    filename: 'anim_panel.js',
    library: 'AnimPanel',
    libraryTarget: 'umd'
  },
  loaders: [
    { test: /\.css$/, 
      loader: 'style-loader!css-loader'
    }
  ]
}