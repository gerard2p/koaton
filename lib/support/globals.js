'use strict';

const fs = require('fs-extra');

const rawpath = require('path');

const path = require('upath');

const configuration = require('./configuration').default;

const BundleItem = require('./BundleItem').default;

global.makeObjIterable = function makeObjIterable(obj) {
	obj[Symbol.iterator] = function () {
		let keys = Object.keys(this),
		    index = -1;
		return {
			next: () => ({
				value: this[keys[++index]],
				done: !(index < keys.length)
			})
		};
	};
};
global.cleanString = text => {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
};
global.requireSafe = function requireSafe(lib, defaults) {
	try {
		return require(lib);
	} catch (e) {
		if (defaults === undefined) {
			console.log(e.stack);
		}
		return defaults;
	}
};
global.requireNoCache = function requireNoCache(lib, defaults) {
	let library = rawpath.normalize(rawpath.resolve(lib));
	if (library.indexOf('.json') === -1) {
		library = library.replace('.js', '') + '.js';
	}
	delete require.cache[library];
	return requireSafe(library, defaults);
};
global.ProyPath = function (...args) {
	args.splice(0, 0, process.cwd());
	return path.normalize(path.join.apply(path, args));
};

//TODO I don't like this here
process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');
require('module').Module._initPaths();

global.configuration = new configuration();

global.Kmetadata = {
	bundles: {}
};
try {
	let bundles = fs.readJsonSync(ProyPath('.koaton')).bundles;
	for (const idx in bundles) {
		global.Kmetadata.bundles[idx] = new BundleItem(idx, bundles[idx]);
	}
} catch (e) {
	//do nothing
}