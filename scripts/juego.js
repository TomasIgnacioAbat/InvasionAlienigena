class Juego {
  pixiApp;
  tiendas = {};
  personas = [];
  anchoPantalla = 1280;
  altoPantalla = 720;
  fondo;
  spritesAnimados = {};
  mouse = {};
  contador = 0;
  contadorGameLoop = 0

  constructor() {
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.inciarPixi();
  }

  //async indica q este metodo es asincrónico, es decir q debe usar "await".
  async inciarPixi() {
    this.pixiApp = new PIXI.Application(); //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.renombrarEscenario("El Stage");
    globalThis.__PIXI_APP__ = this.pixiApp; //esto es para que funcione la extension de pixi

    const opcionesDePixi = {
      backgroundColor: "#1099bb",
      width: this.anchoPantalla,
      height: this.altoPantalla,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado, puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi); //cuando termina se incializa pixi con las opciones definidas anteriormente

    document.body.appendChild(this.pixiApp.canvas); //agregamos el elementos canvas creado por pixi en el documento html

    // const texture = await PIXI.Assets.load("bunny.png"); //cargamos la imagen bunny.png y la guardamos en la variable texture (deprecated, ahora lo tengo como ejemplo nomás)
    await this.ejecutarCodigoDespuesDeIniciarPIXI();
    //si se quiere añadir algo, agregarlo a este método
  }
  
  async ejecutarCodigoDespuesDeIniciarPIXI() {
    this.crearTexturaDeFondo();
    this.crearTiendas();
    await this.cargarTodasLasTexturas(diccionarioDeTexturas());
    this.crear_PersonasCompradoras(100);
    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.gameLoopBind = this.gameLoop.bind(this)
    this.pixiApp.ticker.add(this.gameLoopBind);
    this.agregarInteractividadDelMouse();
  }

  //Configuraciones de pixi --------
  renombrarEscenario(nuevoNombre) {
    this.pixiApp.stage.name = nuevoNombre;
  }

  async cargarTexturas(stringLocalizacionTextura) {
    const unaTextura = await PIXI.Assets.load(stringLocalizacionTextura);
    return unaTextura;
  }

  async cargarTodasLasTexturas(diccionarioDeTexturas) {
    for (let nombreAnimacion of Object.keys(diccionarioDeTexturas)) {
      this.spritesAnimados[nombreAnimacion] = await this.cargarTexturas(diccionarioDeTexturas[nombreAnimacion]);
    }
  }

  //Cierra configuraciones de pixi -----------------------

  //Agregar elementos ------------------------------------
  async crearTiendas() {
    await this.crearTiendaRoja();
    await this.crearTiendaVerde();
    await this.crearTiendaAmarilla();
    await this.crearTiendaDelJugador();
  }

  async crearTiendaDelJugador() {
    const texturaTienda = await this.cargarTexturas("img/Tiendas/tiendaJugador.json");
    const xInicial = 0.8 * this.anchoPantalla; //1280
    const yInicial = 0.85 * this.altoPantalla; //720
    const zInicial = -20;
    const valorTiempo = 5;
    const valorCalidad = 5;
    const valorDinero = 5;

    this.tiendas["TiendaJugador"] = this.crearUnaTienda(texturaTienda, xInicial, yInicial, zInicial, valorTiempo, valorCalidad, valorDinero);
    this.tiendas["TiendaJugador"].spritesAnimados["tiendaJugador"].anchor.set(0.5, 0.5);
    this.tiendas["TiendaJugador"].spritesAnimados["tiendaJugador"].scale.set(0.4);
  }

  async crearTiendaAmarilla() {
    const texturaTienda = await this.cargarTexturas("img/Tiendas/tiendaAmarilla.json");
    const xInicial = 0.6 * this.anchoPantalla; //1280
    const yInicial = 0.85 * this.altoPantalla; //720
    const zInicial = -20;
    const valorTiempo = 5;
    const valorCalidad = 8;
    const valorDinero = 1;

    this.tiendas["TiendaAmarilla"] = this.crearUnaTienda(texturaTienda, xInicial, yInicial, zInicial, valorTiempo, valorCalidad, valorDinero);
    this.tiendas["TiendaAmarilla"].spritesAnimados["tiendaAmarilla"].anchor.set(0.5, 0.5);
    this.tiendas["TiendaAmarilla"].spritesAnimados["tiendaAmarilla"].scale.set(0.4);
  }

  async crearTiendaVerde() {
    const texturaTienda = await this.cargarTexturas("img/Tiendas/tiendaVerde.json");
    const xInicial = 0.4 * this.anchoPantalla; //1280
    const yInicial = 0.85 * this.altoPantalla; //720
    const zInicial = -20;
    const valorTiempo = 5;
    const valorCalidad = 2;
    const valorDinero = 7;

    this.tiendas["TiendaVerde"] = this.crearUnaTienda(texturaTienda, xInicial, yInicial, zInicial, valorTiempo, valorCalidad, valorDinero);
    this.tiendas["TiendaVerde"].spritesAnimados["tiendaVerde"].anchor.set(0.5, 0.5);
    this.tiendas["TiendaVerde"].spritesAnimados["tiendaVerde"].scale.set(0.4);
  }

  async crearTiendaRoja() {
    const texturaTienda = await this.cargarTexturas("img/Tiendas/tiendaRoja.json");
    const xInicial = 0.2 * this.anchoPantalla; //1280
    const yInicial = 0.85 * this.altoPantalla; //720
    const zInicial = -20;
    const valorTiempo = 4;
    const valorCalidad = 6;
    const valorDinero = 4;

    this.tiendas["TiendaRoja"] = this.crearUnaTienda(texturaTienda, xInicial, yInicial, zInicial, valorTiempo, valorCalidad, valorDinero);
    this.tiendas["TiendaRoja"].spritesAnimados["tiendaRoja"].anchor.set(0.5, 0.5);
    this.tiendas["TiendaRoja"].spritesAnimados["tiendaRoja"].scale.set(0.4);
  } 

  crearUnaTienda(SprteSheetOBJ, xInicial, yInicial, zInicial, valorTiempo, valorCalidad, valorDinero) {
      return new Tienda(SprteSheetOBJ, xInicial, yInicial, zInicial, this, valorTiempo, valorCalidad, valorDinero);
  }

  async crearTexturaDeFondo() {
    const texturaFondo = await this.cargarTexturas("img/Tiendas/fondo.json")
    const xInicial = 0.5 * this.anchoPantalla;
    const yInicial = 0.5 * this.altoPantalla;
    const zInicial = -100;
    this.fondo = await this.crearObjetoEstatico(
      texturaFondo,
      xInicial,
      yInicial,
      zInicial
    );
    this.fondo.spritesAnimados["imagen"].anchor.set(0.5, 0.5);
  }

  async crearObjetoEstatico(textura, xIncial, yIncial, zInicial) {
    return new objetoEstatico(textura, xIncial, yIncial, zInicial, this);
  }

  async crear_PersonasCompradoras(numeroDePersonas) {
    for (let i = 0; i < numeroDePersonas; i++) {
      const nuevaPersona = await this.crearPersonaComprador();
      this.personas.push(nuevaPersona);
      //console.log("PersonaComprador creada");
    }
    this.asignarEventosAPersonas();
    //console.log("Creadas todas las PersonasCompradoras");
  }

  async crearPersonaComprador() {
    //Crea una instancia de clase que elijamos, el constructor de dicha clase toma como parametros la textura q queremos usar, X, Y y una referencia a la instancia del juego (la que sería this ya que estamos dentro de la clase Juego)
    const importanciaCalidad = randomEntreUnoyDiez();
    const importanciaDinero = randomEntreUnoyDiez();
    const importanciaTiempo = randomEntreUnoyDiez();
    const textura = await this.spritesAnimados[
      devolverNombreDelColor(
        indiceDelElementoMasGrandeDelArray(
          [importanciaCalidad, importanciaDinero, importanciaTiempo]
        )
      )
    ]
    const xIncial = 0.5 * this.anchoPantalla;
    const yIncial = 0.5 * this.altoPantalla;
    const juegoEnElQueEstoy = this;
    return new PersonaComprador(
      textura,
      xIncial,
      yIncial,
      juegoEnElQueEstoy,
      importanciaTiempo,
      importanciaDinero,
      importanciaCalidad
    );
  }
  //Cierra agregar elementos -----------------------------

  asignarEventosAPersonas(){
    this.asignarElMouseComoTargetATodosLasPersonas()
    // this.asignarPerseguidorRandomATodos();
    // this.asignarTargets();
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  getPersonaRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  asignarTargets() {
    for (let cone of this.personas) {
      cone.asignarTarget(this.getPersonaRandom());
    }
  }

  asignarElMouseComoTargetATodosLasPersonas() {
    for (let personaje of this.personas) {
      personaje.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let cone of this.personas) {
      cone.perseguidor = this.getPersonaRandom();
    }
  }

  asignarElMouseComoPerseguidorATodosLasPersonas() {
    for (let cone of this.personas) {
      cone.perseguidor = this.mouse;
    }
  }

  eliminarPersona(indiceDeLaPersona) {
    const laPersona = this.personas[indiceDeLaPersona]
    this.personas.pop(indiceDeLaPersona);
    console.log(laPersona.getID())
    laPersona.eliminarDeEscena();
  }
  
  gameLoop(time) {
    this.contarUnSegundo(time);
    for (let unaPersona of this.personas) {
      //ejecutamos el metodo tick de persona
      unaPersona.tick();
      unaPersona.render();
     
    }
  }

  contarUnSegundo(time) {
    this.contadorGameLoop += time * (1000/60)
    if(this.contadorGameLoop >= 1000) {
      this.contador += 1
      this.contadorGameLoop = 0 
    }
  }
}
