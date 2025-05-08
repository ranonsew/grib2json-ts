"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grib2json = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const grib2jsonCommand = process.env.GRIB2JSON ??
    node_path_1.default.join(__dirname, '..', 'bin', node_os_1.default.platform() === 'win32' ? 'grib2json.cmd' : 'grib2json');
const INTERNAL_OPTIONS = ['bufferSize', 'version', 'precision', 'verbose'];
function createNumberFormatter(precision) {
    return (key, value) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Number(value.toFixed(precision));
        }
        return value;
    };
}
const grib2json = async (filePath, options) => {
    console.log('grib2jsoncommand:', grib2jsonCommand);
    console.log('grib2jsonenv:', process.env.GRIB2JSON);
    const optionKeys = Object.keys(options).filter((key) => options[key] !== undefined && !INTERNAL_OPTIONS.includes(key));
    const args = [];
    for (const key of optionKeys) {
        args.push(`--${key}`);
        if (typeof options[key] !== 'boolean') {
            args.push(String(options[key]));
        }
    }
    args.push(filePath);
    const execArgs = node_os_1.default.platform() === 'win32' ? ['/c', grib2jsonCommand, ...args] : args;
    const execCmd = node_os_1.default.platform() === 'win32' ? 'cmd.exe' : grib2jsonCommand;
    try {
        const { stdout, stderr } = await execFileAsync(execCmd, execArgs, {
            maxBuffer: options.bufferSize ?? 8 * 1024 * 1024,
        });
        if (stderr && options.verbose) {
            console.error(stderr);
        }
        if (options.output) {
            const json = await fs_extra_1.default.readJson(options.output);
            if (options.verbose) {
                json.forEach((variable) => console.log(`Wrote ${variable.data.length} points into file for variable`, variable.header));
            }
            if ((options.precision ?? -1) >= 0) {
                const formatter = createNumberFormatter(options.precision ?? -1);
                await fs_extra_1.default.writeFile(options.output, JSON.stringify(json, formatter));
            }
            return json;
        }
        else {
            const json = JSON.parse(stdout);
            if (options.verbose) {
                json.forEach((variable) => console.log(`Generated ${variable.data.length} points in memory for variable`, variable.header));
            }
            return json;
        }
    }
    catch (error) {
        console.error('Error running grib2json:', error);
        throw error;
    }
};
exports.grib2json = grib2json;
