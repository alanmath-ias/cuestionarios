
import katex from 'katex';

const doubleBackslash = "\\\\mathbf{u}";
const singleBackslash = "\\mathbf{u}";

console.log('String with double backslash:', doubleBackslash);
console.log('Rendered double:', katex.renderToString(doubleBackslash, { throwOnError: false }));

console.log('String with single backslash:', singleBackslash);
console.log('Rendered single:', katex.renderToString(singleBackslash, { throwOnError: false }));
