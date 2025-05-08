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
export declare const grib2json: (filePath: string, options: Grib2JsonOptions) => Promise<any[]>;
export {};
//# sourceMappingURL=index.d.ts.map