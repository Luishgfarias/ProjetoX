// Helper para testes manuais de estados assíncronos, como loading de tela.
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
