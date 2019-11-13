const arr = []
if (process.env.NODE_ENV === 'production') {//判断当前是开发还是上线阶段
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  "presets": [
    "@vue/app"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    ...arr,
    '@babel/plugin-syntax-dynamic-import'
  ]
}