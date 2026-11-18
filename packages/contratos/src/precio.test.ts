import { describe, expect, it } from "vitest";
import { formatearPrecio } from "./precio";

describe("formatearPrecio", () => {
  it("formatea guaraníes con separador de miles y sin decimales", () => {
    const texto = formatearPrecio(150000);
    expect(texto).toMatch(/150\.000/);
    expect(texto).not.toMatch(/,\d/);
  });

  it("acepta cero", () => {
    expect(formatearPrecio(0)).toMatch(/0/);
  });

  it.each([-1, 10.5, Number.NaN])("rechaza %s", (valor) => {
    expect(() => formatearPrecio(valor)).toThrow(RangeError);
  });
});
