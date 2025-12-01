class Persona extends GameObject {
  velocidad;
  velocidadMaxima = 3;
  aceleracion;
  aceleracionMaxima = 0.2;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;
  vision;
  target;
  perseguidor;

  constructor(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy) {
    super(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy);
    this.container.name = "Contenedor de Persona";
    this.vision = Math.random() * 200 + 1300;
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };
    this.cambiarAnimacion("caminarAbajo");
  }

  obtenerOtraPersona() {
    return this.juego.personas;
  }

  tick() {
    super.tick();
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
    this.separacion();
    this.escapar();
    this.perseguir();
    this.limitarAceleracion();
    this.aplicarFriccion();
    this.limitarVelocidad();
  }

  separacion() {
    let promedioDePosicionDeAquellosQEstanCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.personas) {
      if (persona == this) {
        continue;
      }
      if (this.laPersona_InvadeMiEspacioPersonal(persona)) {
        contador++;
        promedioDePosicionDeAquellosQEstanCercaMio.x += persona.posicion.x;
        promedioDePosicionDeAquellosQEstanCercaMio.y += persona.posicion.y;
      }
    }

    if (contador == 0) {
      return;
    }

    promedioDePosicionDeAquellosQEstanCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanCercaMio.y /= contador;

    //Este es un vector que se aleja del promedio de posicion de las personas que estan cerca mio, tomando mi posición como referencia.
    //Para ponerlo en palabras simples, se agarra el promedio y se le resta nuestra posición. Esto nos da un punto para que la persona vaya, alejándose de ese promedio.
    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanCercaMio.y,
    };

    //Como el vector puede ser muy grande, lo limitamos a una magnitud maxima de 1.
    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion,
      1
    );

    //Y este es el factor de cuánto afecta esta fuerza de separacion a la aceleración de la persona, modificando la velocidad.
    //Acá se ejecuta la separación yendo hacia el vector que aleja al personaje.
    const factor = 10;

    this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor;
    this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor;
  }

  laPersona_InvadeMiEspacioPersonal(otraPersona) {
    return (
      calcularDistancia(this.posicion, otraPersona.posicion) <
      this.distanciaPersonal
    );
  }

  escapar() {
    if (!this.hayPerseguidor()) {
      return;
    }

    if (!puedoVerALaPersona_(this.perseguidor)) {
      return;
    }

    const diferenciaEntreLasPosicionesEnX =
      this.perseguidor.posicion.x - this.posicion.x;
    const diferenciaEntreLasPosicionesEnY =
      this.perseguidor.posicion.y - this.posicion.y;

    let vectorDePuntoDeEscape = {
      x: -diferenciaEntreLasPosicionesEnX,
      y: -diferenciaEntreLasPosicionesEnY,
    };
    vectorDePuntoDeEscape = limitarVector(vectorDePuntoDeEscape, 1);

    this.aceleracion.x += -vectorDePuntoDeEscape.x;
    this.aceleracion.y += -vectorDePuntoDeEscape.y;
  }

  hayPerseguidor() {
    return this.perseguidor;
  }

  distanciaEntreLaPersona_YYo(unaPersona) {
    return calcularDistancia(this.posicion, unaPersona.posicion);
  }

  puedoVerALaPersona_(unaPersona) {
    return this.distanciaEntreLaPersona_YYo(unaPersona) <= this.vision;
  }

  perseguir() {
    if (!this.hayTarget()) {
      return;
    }

    if (!this.puedoVerALaPersona_(this.target)) {
      return;
    }

    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factorDecaidaVelocidad = Math.pow(
      this.distanciaEntreLaPersona_YYo(this.target) / this.distanciaParaLlegar,
      3
    );

    const diferenciaEntreLasPosicionesEnX =
      this.target.posicion.x - this.posicion.x;
    const diferenciaEntreLasPosicionesEnY =
      this.target.posicion.y - this.posicion.y;

    let vectorDePuntoDeEscape = {
      x: -diferenciaEntreLasPosicionesEnX,
      y: -diferenciaEntreLasPosicionesEnY,
    };
    vectorDePuntoDeEscape = limitarVector(vectorDePuntoDeEscape, 1);

    this.aceleracion.x += -vectorDePuntoDeEscape.x * factorDecaidaVelocidad;
    this.aceleracion.y += -vectorDePuntoDeEscape.y * factorDecaidaVelocidad;
  }

  hayTarget() {
    return this.target;
  }

  limitarAceleracion() {
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
    this.ajustarVelocidadSegunDeltaTime();
  }

  ajustarVelocidadSegunDeltaTime() {
    this.velocidad.x +=
      this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y +=
      this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;
  }

  aplicarFriccion() {
    const friccion = 0.95 ** this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.x *= friccion;
    this.velocidad.y *= friccion;
  }

  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }

  asignarTarget(quien) {
    this.target = quien;
  }

}
