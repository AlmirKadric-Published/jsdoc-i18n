jsdoc-i18n
==========
`jsdoc-i18n` is an internationalization workflow developed around the `jsdoc` documentation tool.

What this means exactly is:
 - you can export `jsdoc` data into an intermediate database
 - you can use the built in tool to create multiple translations of each `jsdoc` item
 - you can render these language variations into separate language folders

Also we really tried to make `jsdoc-i18n` an extension of the existing `jsdoc` tool, giving it a
relatively small footprint. This means that the `jsdoc` configuration system, all existing `jsdoc`
arguments, as well as existing `jsdoc` templates (with very minor patching) are supported.


Installation
------------
To install `jsdoc-i18n` globally
```
npm install -g jsdoc-i18n
```

To add `jsdoc-i18n` as a dependency to you project
```
npm install --save jsdoc-i18n
```


Configuration
-------------
On top of the existing `jsdoc` configuration options, the following options are accepted under the
`i18n` rootpath:
 - `defaultLang`: The default language existing documentation is written in (**Default**: `en`)
 - `dbPlugin`: The `jsdoc-i18n` database plugin to be used when saving or retrieving `jsdoc` data.
    This can be either a filename or a string reference to one of the `jsdoc-i18n` internal database
    plugins (**Default**: `file`)
 - `dbFilePath`: Path to database json files for `jsdoc-i18n` internal database `file` plugin
    (**Default**: `./i18n`)
 - `serverPort`: Port on which `jsdoc-i18n` translation web application tool should listen
    (**Default**: `8080`)
 - `serverCheckPaths`: Paths which `jsdoc-i18n` translation web application tool tool check when a
    request is made (**Default**: `['.', 'index.html', 'index.htm']`)

**NOTE:**  
Currently these options cannot be set via command line. Therefore the configuration file argument is
required for `jsdoc-i18n` to function properly.


Usage
-----
To import `jsdoc` data to `jsdoc-i18n` database:  
(Supports `jsdoc` arguments)
```
jsdoc-i18n-import -c path/to/your/conf.json path/to/files/to/be/parsed
```

To start `jsdoc-i18n` translation Web Application Tool:  
([http://localhost:8080](http://localhost:8080))
```
jsdoc-i18n-server -c path/to/your/conf.json
```

To render data from `jsdoc-i18n` database with given language  
(Supports `jsdoc` arguments)
```
jsdoc-i18n-render -c path/to/your/conf.json -l <language>
```


License
-------
`jsdoc-i18n` is free software, licensed under the MIT License.  
See the `LICENSE.md` file in this repository for more details.
