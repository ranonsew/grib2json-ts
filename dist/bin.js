#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_path_1 = __importDefault(require("node:path"));
const commander_1 = require("commander");
const index_js_1 = require("./index.js");
const packageInfo = fs_extra_1.default.readJsonSync(node_path_1.default.resolve(__dirname, '../package.json'));
const program = new commander_1.Command();
program
    .name('grib2json-cli')
    .version(packageInfo.version)
    .usage('[options] <file>')
    .option('-d, --data', 'Print GRIB record data')
    .option('-c, --compact', 'Enable compact Json formatting')
    .option('--fc, --filter.category <value>', 'Select records with this numeric category')
    .option('--fs, --filter.surface <value>', 'Select records with this numeric surface type')
    .option('--fp, --filter.parameter <value>', 'Select records with this numeric parameter')
    .option('--fv, --filter.value <value>', 'Select records with this numeric surface value')
    .option('-n, --names', 'Print names of numeric codes')
    .option('-o, --output <file>', 'Output in a file instead of stdout')
    .option('-p, --precision <precision>', 'Limit precision in output file using the given number of digits after the decimal point', '-1')
    .option('-v, --verbose', 'Enable logging to stdout')
    .option('--bs, --bufferSize <value>', 'Largest amount of data in bytes allowed on stdout or stderr')
    .argument('<file>', 'Input GRIB file')
    .parse(process.argv);
const opts = program.opts();
opts.precision = parseInt(opts.precision, 10);
const inputFile = program.args[program.args.length - 1];
try {
    (async () => { await (0, index_js_1.grib2json)(inputFile, opts); })();
}
catch (err) {
    console.error(typeof err, '\nerror:', err);
}
