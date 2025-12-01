class GameObject {
  sprite;
  id;
  posicion;
  spritesAnimados = {};
  radio = 10;
  juego;
  container;
  angulo = 180;
  velocidadLineal;

  constructor(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy) {
    //console.log(xIncial, "Si esta desempaquetado");
    this.container = new PIXI.Container();
    this.container.name = "Contenedor de GameObject";
    this.posicion = { x: xIncial, y: yIncial };
    this.juego = juegoEnElQueEstoy; //guarda una referencia a la instancia del juego
    this.id = Math.floor(Math.random() * 99999999); //generamos un ID para este gameObject
    this.cargarSpritesAnimados(SprteSheetOBJ); //Tomo como parametro la textura y creo un sprite
    this.juego.pixiApp.stage.addChild(this.container); //Se añade el container (es decir, el contenedor de pixi que contiene las animaciones) al escenario
  }

  eliminarDeEscena() {
    this.juego.pixiApp.stage.removeChild(this.container);
    this.container = new PIXI.Container();
  }

  cargarSpritesAnimados(SprteSheetOBJ) {
    //console.log("desde aca, en el cargador de sprites me dan ", SprteSheetOBJ); 
    for (let llave of Object.keys(SprteSheetOBJ.animations)) {
      this.spritesAnimados[llave] = new PIXI.AnimatedSprite(
        SprteSheetOBJ.animations[llave]
      );

      this.spritesAnimados[llave].play();
      this.spritesAnimados[llave].loop = true;
      this.spritesAnimados[llave].animationSpeed = 0.1;
      //this.spritesAnimados[llave].scale.set(0.5);
      this.spritesAnimados[llave].anchor.set(0.5, 1); //establezco el punto de pivot en el medio (0.5, 1)
      this.container.addChild(this.spritesAnimados[llave]);
    }
  }

  cambiarAnimacion(nombreDeAnimacionEnElJSON) {
    //para que de el efecto de que "cambia" de animación hacemos todos invisibles
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    //y despues hacemos visible el que queremos que se vea
    this.spritesAnimados[nombreDeAnimacionEnElJSON].visible = true;
  }

  tick() {
    //El método que se llama en cada frame, este se llama porque se lo referencia en "juego.js" dentro del gameLoop
    //variaciones de la velocidad
    //this.rebotar(); //nos sirve en nuestro contexto?
    this.moverPosicionSegunVelocidadYPixelesPorFrame();
    this.guardarAnguloActual();
    this.guardarVelocidadLinealActual();
  }

  guardarAnguloActual() {
    this.angulo =
      radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
  }

  guardarVelocidadLinealActual() {
    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y
    );
  }

  cambiarDeSpriteAnimadoSegunAngulo() {
    //0 grados es a la izq, abre en sentido horario, por lo cual 180 es a la derecha
    //90 es para arriba
    //270 abajo

    if ((this.angulo > 315 && this.angulo < 360) || this.angulo < 45) {
      this.cambiarAnimacion("caminarIzquierda");
      //this.spritesAnimados.caminarDerecha.scale.x = -2;
    } 
    else if (this.angulo > 135 && this.angulo < 225) {
      this.cambiarAnimacion("caminarDerecha");
      //this.spritesAnimados.caminarDerecha.scale.x = 1;
    } 
    else if (this.angulo < 135 && this.angulo > 45) {
      this.cambiarAnimacion("caminarArriba");
    } 
    else {
      this.cambiarAnimacion("caminarAbajo");
    }
  }

  moverPosicionSegunVelocidadYPixelesPorFrame() {
    //movimiento en pixeles por frame
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;
  }

  rebotar() {
    //ejemplo mas realista
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      //si la coordenada X de este conejito es mayor al ancho del stage,
      //o si la coordenada X.. es menor q 0 (o sea q se fue por el lado izquierdo)
      //multiplicamos por -0.99, o sea que se invierte el signo (si era positivo se hace negativo y vicecversa)
      //y al ser 0.99 pierde 1% de velocidad
      this.velocidad.x *= -0.99;
    }

    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      this.velocidad.y *= -0.99;
    }
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;

    //this.container.zIndex = this.posicion.y;
    this.container.zIndex = -30

    this.cambiarDeSpriteAnimadoSegunAngulo();
    this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
  }

  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed =
        this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }

  getID() {
    return this.id;
  }
}
