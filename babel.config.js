module.exports = {
  'presets': [
    ['@babel/preset-env', {
      'targets': {
        'node': '8'
      },
      'modules': process.env.BABEL_MODULES ? process.env.BABEL_MODULES : false
    }]
  ]
}
