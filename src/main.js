const file = require('fs');
const path = require('path');
const fspath = require('fs-path');
const xml2js = require('xml2js');
const async = require('async');
const tomd = require('to-markdown');
const request = require('request');
const yaml = require('js-yaml');
const slugme = require('slugme');
const dateFormat = require('dateformat');

let i = 0;

const captialize = str => {
	return str[0].toUpperCase() + str.substring(1);
};

const replaceTwoBrace = str => {
	str = str.replace(/{{/g, '{ {');
	return str;
};

const createFile = (c, dest, next) => {
	const date = new Date(c.date);
  const datename = dateFormat(date, "yyyy-mm-dd-");

  const folder = (c.layout==='post' || c.layout==='page') ? c.layout + 's' : c.layout;

	const filename = path.join(dest, '/_' + folder + '/', datename + c.slug + '.md');
  const content = c.content;
  delete c.content;

  const sep = '---\n';
  const attr = yaml.safeDump(c);
	const fileInput = sep + attr + sep + '\n' + content;

	fspath.writeFile(path.resolve(filename), fileInput, err => {
		i += 1;
		console.log(`Adding ${c.layout} ${i}...`);
    console.log(`To: ${filename}`);
		if (err) {
			throw err;
		}
		console.log('Done.');
    next();
	});
};

const exportPosts = callback => {
	const args = process.argv.slice(2);
	const source = args[0] && args[0];
  const dest = args[1] ? args[1] : '.';

	if (!source) {
		const help = [
			'Usage: wp2jekyll <source> <dest>',
			'',
			'For more help, you can check the docs: https://www.npmjs.com/package/wordpress2jekyll'
		];

		console.log(help.join('\n'));
		return callback(help);
	}

	console.log('Analyzing %s...', source);

	async.waterfall([
		function (next) {
      // URL regular expression from: http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without-the
			if (source.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/)) {
				request(source, (err, res, body) => {
					if (err) {
						throw err;
					}
					if (res.statusCode === 200) {
						next(null, body);
					}
				});
			} else {
				file.readFile(source, next);
			}
		},
		function (content, next) {
			xml2js.parseString(content, next);
		},
		function (xml, next) {
			let count = 0;

			async.each(xml.rss.channel[0].item, (item, next) => {
				if (!item['wp:post_type']) {
					return next();
				}

				const title = item.title[0].replace(/"/g, '\\"');
				const id = item['wp:post_id'][0];
				const date = item['wp:post_date'][0];
				const slug = item['wp:post_name'][0];
				let content = item['content:encoded'][0];
				const comment = item['wp:comment_status'][0];
				const status = item['wp:status'][0];
				const type = item['wp:post_type'][0];
        const author = item['dc:creator'][0];
				const categories = [];
				const tags = [];

				if (!title && !slug) {
					return next();
				}
				if (type !== 'post' && type !== 'page') {
					return next();
				}
				if (typeof content !== 'string') {
					content = '';
				}
				content = replaceTwoBrace(content);
				content = tomd(content).replace(/\r\n/g, '\n');
				count++;

				if (item.category) {
					item.category.forEach(category => {
						const name = category._;

						switch (category.$.domain) {
							case 'category':
								categories.push(name);
								break;

							case 'post_tag':
								tags.push(name);
								break;

							default:
						}
					});
				}

				const data = {
          author,
					title: title || slug,
          slug: slug || slugme(title),
					id: Number(id),
					date,
					content,
					layout: status === 'draft' ? 'draft' : 'post'
				};

				if (type === 'page') {
					data.layout = 'page';
				}
				if (slug) {
					data.slug = slug;
				}
				if (comment === 'closed') {
					data.comments = false;
				}
				if (categories.length > 0 && type === 'post') {
					data.categories = categories;
				}
				if (tags.length > 0 && type === 'post') {
					data.tags = tags;
				}

				console.log('%s found: %s', captialize(type), title);
        createFile(data, dest, next);
			}, err => {
				if (err) {
					return next(err);
				}

				console.log('%d posts migrated.', count);
        callback();
			});
		}
	], callback);
};

module.exports = exportPosts;
