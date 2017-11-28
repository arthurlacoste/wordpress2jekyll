
# Wordpress to Jekyll


[![NPM Version][npm-version]][npm-url]
[![travis][travis-badge]][travis-url]
[![xo][xo-badge]][xo-url]

This tool allow you to export **almost all of your posts and pages contents** (including comments)  from a WordPress blog, to be used on [Jekyll] with [Staticman] (v2).

## Install

```
npm i wordpress2jekyll -g
```

## Usage

First, emport all data from WordPress with the built-in export tool (Tool > Export), then launch this command:

```terminal
wp2jekyll {{ xml file }} {{ folder for comments }}
```

Example:

```terminal
wp2jekyll myblog.xml /my/folder
```

# Licence

MIT

[npm-version]:https://img.shields.io/npm/v/wordpress2jekyll.svg
[npm-url]: https://npmjs.org/package/wordpress2jekyll
[travis-badge]: http://img.shields.io/travis/arthurlacoste/wordpress2jekyll.svg
[travis-url]: https://travis-ci.org/arthurlacoste/wordpress2jekyll
[xo-badge]: https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo-url]: https://github.com/sindresorhus/xo

[Jekyll]: https://jekyllrb.com
[Staticman]: https://staticman.net
