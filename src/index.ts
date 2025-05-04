import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const grib2jsonCommand: string =
  process.env.GRIB2JSON ??
  path.join(__dirname, '..', 'bin', os.platform() === 'win32' ? 'grib2json.cmd' : 'grib2json');

const INTERNAL_OPTIONS: readonly string[] = ['bufferSize', 'version', 'precision', 'verbose'];

interface Grib2JsonOptions {
  bufferSize?: number;
  version?: string;
  precision?: number;
  verbose?: boolean;
  output?: string;
  data?: boolean;
  compact?: boolean;
  names?: boolean;
  [key: string]: any;
}

function createNumberFormatter(precision: number) {
  return (key: string, value: any): any => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Number(value.toFixed(precision));
    }
    return value;
  };
}

export const grib2json = async (filePath: string, options: Grib2JsonOptions): Promise<any[]> => {
  console.log('grib2jsoncommand:', grib2jsonCommand);
  console.log('grib2jsonenv:', process.env.GRIB2JSON);

  const optionKeys = Object.keys(options).filter(
    (key) => options[key] !== undefined && !INTERNAL_OPTIONS.includes(key as any)
  );

  const args: string[] = [];
  for (const key of optionKeys) {
    args.push(`--${key}`);
    if (typeof options[key] !== 'boolean') {
      args.push(String(options[key]));
    }
  }

  args.push(filePath);

  const execArgs = os.platform() === 'win32' ? ['/c', grib2jsonCommand, ...args] : args;
  const execCmd = os.platform() === 'win32' ? 'cmd.exe' : grib2jsonCommand;

  try {
    const { stdout, stderr } = await execFileAsync(execCmd, execArgs, {
      maxBuffer: options.bufferSize ?? 8 * 1024 * 1024,
    });

    if (stderr && options.verbose) {
      console.error(stderr);
    }

    if (options.output) {
      const json = await fs.readJson(options.output);
      if (options.verbose) {
        json.forEach((variable: any) =>
          console.log(
            `Wrote ${variable.data.length} points into file for variable`,
            variable.header
          )
        );
      }

      if ((options.precision ?? -1) >= 0) {
        const formatter = createNumberFormatter(options.precision ?? -1);
        await fs.writeFile(options.output, JSON.stringify(json, formatter));
      }

      return json;
    } else {
      const json = JSON.parse(stdout);
      if (options.verbose) {
        json.forEach((variable: any) =>
          console.log(
            `Generated ${variable.data.length} points in memory for variable`,
            variable.header
          )
        );
      }
      return json;
    }
  } catch (error) {
    console.error('Error running grib2json:', error);
    throw error;
  }
};
