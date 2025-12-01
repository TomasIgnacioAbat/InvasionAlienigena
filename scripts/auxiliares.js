function radianesAGrados(radianes) {
  return radianes * (180 / Math.PI);
}

function calcularDistancia(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function limitarVector(vector, magnitudMaxima) {
  const magnitudActual = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (magnitudActual > magnitudMaxima) {
    const escala = magnitudMaxima / magnitudActual;
    return {
      x: vector.x * escala,
      y: vector.y * escala,
    };
  }

  // Si ya está dentro del límite, se devuelve igual
  return { ...vector };
}

function mayorValorDeUnDiccionario(diccionario) {
  let mayorValor = 0;
  for (let valor of Object.values(diccionario)) {
    if (valor > mayorValor) {
      mayorValor = valor;
    }
  }
  return mayorValor;
}

function randomEntreUnoyDiez() {
  return Math.floor(Math.random() * 10) + 1;
}

function randomEntreCeroYUno() {
  let numero = Math.floor(Math.random() * 10);
  if (numero < 5) {
    return 0;
  } 
  else {
    return 1;
  }
}

function diccionarioDeTexturas () {
  return {
    mAmarillo: "img/SpritesPersonajes/Hombre/Amarillo/mAmarillo.json",
    mRojo: "img/SpritesPersonajes/Hombre/Rojo/mRojo.json",
    mVerde: "img/SpritesPersonajes/Hombre/Verde/mVerde.json",
    fAmarillo: "img/SpritesPersonajes/Mujer/Amarillo/fAmarillo.json",
    fRojo: "img/SpritesPersonajes/Mujer/Rojo/fRojo.json",
    fVerde: "img/SpritesPersonajes/Mujer/Verde/fVerde.json"
  };
}

function devolverNombreDelColor(numeroDelColor){
  let listaDeNombresDeColores = [
    ["mAmarillo", "fAmarillo"], 
    ["mRojo", "fRojo"], 
    ["mVerde", "fVerde"]];
  return listaDeNombresDeColores[numeroDelColor][randomEntreCeroYUno()];
}

function indiceDelElementoMasGrandeDelArray(array) {
  let indiceDelMayor = 0;
  let numeroMasGrandeActual = array[0];
  for (let numero of array) {
    if (numero > numeroMasGrandeActual) {
      numeroMasGrandeActual = numero;
      indiceDelMayor = array.indexOf(numero);
    }
  }
  return indiceDelMayor;
}

/*
class Personalidad {
  constructor(){}

  evaluarTienda(valorTiempo, valorDinero, valorCalidad) {
    return 
  }
}
*/
//performance.memory.totalJSHeapSize/(1024**2); //tamaño de memoria usada en MB