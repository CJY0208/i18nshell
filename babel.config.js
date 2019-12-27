module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        exclude: [/typeof/]
      }
    ]
  ],
  plugins: ['@babel/plugin-proposal-class-properties']
}
