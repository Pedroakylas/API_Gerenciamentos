const { obterPorta } = require('../src/config/servidor');

describe('Configuração do servidor', () => {
  test('deve usar a porta padrão quando PORT não estiver definida', () => {
    expect(obterPorta(undefined)).toBe(3000);
    expect(obterPorta('')).toBe(3000);
  });

  test('deve converter uma porta numérica válida', () => {
    expect(obterPorta('8080')).toBe(8080);
    expect(obterPorta('00080')).toBe(80);
  });

  test.each(['abc', '1.5', '0x50', ' 3000', '3000 '])(
    'deve rejeitar formato de porta inválido: %s',
    valor => {
      expect(() => obterPorta(valor)).toThrow('entre 1 e 65535');
    }
  );

  test.each(['0', '65536', '999999999999999999999'])(
    'deve rejeitar porta fora da faixa permitida: %s',
    valor => {
      expect(() => obterPorta(valor)).toThrow('entre 1 e 65535');
    }
  );
});
