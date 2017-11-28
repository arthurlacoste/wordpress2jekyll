#!/usr/bin/env node
'use strict';

const exportComments = require('wordpress-comments-jekyll-staticman');
const exportPosts = require('./src/main');

exportPosts((err) => {
  if(err) {
    return process.exit(1);
  }
	exportComments();
});
