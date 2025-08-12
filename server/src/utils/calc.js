/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

export function calcLineTotal(qty, price, taxRate = 0) {
  const net = qty * price;
  const tax = +(net * (taxRate / 100)).toFixed(2);
  const gross = +(net + tax).toFixed(2);
  return { net: +net.toFixed(2), tax, gross };
}

export function calcDocTotals(items = []) {
  let net = 0, tax = 0, gross = 0;
  for (const it of items) {
    const { net: n, tax: t, gross: g } = calcLineTotal(it.qty, it.price, it.taxRate || 0);
    net += n; tax += t; gross += g;
  }
  return { net: +net.toFixed(2), tax: +tax.toFixed(2), gross: +gross.toFixed(2) };
}