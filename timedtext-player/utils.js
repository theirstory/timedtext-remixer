export function interpolate(str, params) {
    // console.log({str, params});
    let names = Object.keys(params);
    let vals = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...vals);
}
export function getTimeRange(element) {
    return (element.getAttribute('data-t') ?? '0,0').split(',').map(v => parseFloat(v));
}
export function getOffset(element) {
    return parseFloat(element.getAttribute('data-offset') ?? '0');
}
// private parents(el: HTMLElement | null, selector: string) {
//   const parents = [];
//   while ((el = el?.parentNode as HTMLElement) && el.ownerDocument !== document) {
//     if (!selector || el.matches(selector)) parents.push(el);
//   }
//   return parents;
// }
//# sourceMappingURL=utils.js.map