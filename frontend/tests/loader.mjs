import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function resolve(specifier, context, nextResolve) {
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      for (const extension of ['.ts', '.tsx']) {
        try { return await nextResolve(specifier + extension, context); } catch { /* Try the next source extension. */ }
      }
    }
    throw error;
  }
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', source: 'export default {};', shortCircuit: true };
  if (/\.tsx?$/.test(url)) {
    const source = await readFile(new URL(url), 'utf8');
    return { format: 'module', source: ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, verbatimModuleSyntax: true } }).outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
