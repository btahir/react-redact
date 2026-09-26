import type { DemoDocument } from '../dist/data.cjs';
export interface DemoPageReport { scope: 'current-root'; fields: { id: string; count: number; covered: boolean; required: boolean }[]; unknownFields: string[]; sentinelIndices: number[]; passed: boolean; limitations: string[] }
export declare function checkDemoPage(page: { locator(selector: string): { evaluate<R, A>(fn: (element: Element, args: A) => R, args: A): Promise<R> } }, document: DemoDocument, options?: { root?: string; sentinels?: string[] }): Promise<DemoPageReport>;
