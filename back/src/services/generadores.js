class Generadores {
  static generarCodigoAlfanumerico() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[randomIndex];
    }
    return codigo;
  }
}

module.exports = Generadores
