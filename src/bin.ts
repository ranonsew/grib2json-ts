#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'node:path';
import { Command } from 'commander';
import { grib2json } from './index.js';

const packageInfo = fs.readJsonSync(path.resolve(__dirname, '../package.json'));
const program = new Command();

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
  .option(
    '-p, --precision <precision>',
    'Limit precision in output file using the given number of digits after the decimal point',
    '-1'
  )
  .option('-v, --verbose', 'Enable logging to stdout')
  .option('--bs, --bufferSize <value>', 'Largest amount of data in bytes allowed on stdout or stderr')
  .argument('<file>', 'Input GRIB file')
  .parse(process.argv);

const opts = program.opts();
opts.precision = parseInt(opts.precision, 10);
const inputFile = program.args[program.args.length - 1];

try {
  (async () => { await grib2json(inputFile, opts); })();
} catch (err) {
  console.error(typeof err, '\nerror:', err);
}
