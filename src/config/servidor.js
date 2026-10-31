function obterPorta(valor = process.env.PORT) {
  if (valor === undefined || valor === '') {
    return 3000;
  }

  if (typeof valor !== 'string' || !/^[0-9]+$/.test(valor)) {
    throw new Error('A variável PORT deve ser um número inteiro entre 1 e 65535.');
  }

  const porta = Number(valor);
  if (!Number.isSafeInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('A variável PORT deve ser um número inteiro entre 1 e 65535.');
  }

  return porta;
}

module.exports = { obterPorta };
