// Helpers para testes manuais de estados assíncronos, como loading e erro.
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function simulateError(message = 'Erro simulado para testes'): never {
  throw new Error(message);
}
