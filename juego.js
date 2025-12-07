class Juego {
  pixiApp;
  conejitos = [];
  width;
  height;
  // Agregamos una propiedad para guardar la textura y que sea accesible desde todo el juego
  animacionesPersonaje1; 
  score = 0;
  scoreText;

  constructor() {
    this.width = 1280;
    this.height = 720;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }

  async initPIXI() {
    this.pixiApp = new PIXI.Application();

    this.pixiApp.stage.name = "el stage";
    globalThis.__PIXI_APP__ = this.pixiApp;

    const opcionesDePixi = {
      background: "#1099bb", // Aquí aseguramos que el fondo se vea azul
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    // Inicializamos la app
    await this.pixiApp.init(opcionesDePixi);

    // IMPORTANTE: Agregamos el canvas al HTML (si falta esto, no ves nada)
    document.body.appendChild(this.pixiApp.canvas);

    // Carga de assets
    // Await asegura que no sigamos hasta que la imagen exista
    const texture = await PIXI.Assets.load("bunny.png");
    
    // IMPORTANTE: Usamos 'this.' para guardar la animación en la clase
    // así la función 'generarConejitoEnBorde' puede usarla después.
    this.animacionesPersonaje1 = await PIXI.Assets.load("img/personaje.json");
    const estiloTexto = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: '#ffffff', // Color blanco
        stroke: '#000000', // Borde negro para que se lea bien
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    });

    this.scoreText = new PIXI.Text({ text: 'Puntos: 0', style: estiloTexto });
    this.scoreText.x = 20; // Margen izquierdo
    this.scoreText.y = 20; // Margen superior
    
    // Lo agregamos al escenario
    this.pixiApp.stage.addChild(this.scoreText);
    // -----------------------------------------

    setInterval(() => {
      this.generarConejitoEnemigo();
    }, 800); 

    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    this.agregarInteractividadDelMouse();

    // Configuración de eventos de clic
    this.pixiApp.stage.eventMode = 'static';
    this.pixiApp.stage.hitArea = this.pixiApp.screen;
    this.pixiApp.stage.on('pointerdown', (e) => this.disparar(e));
    
    this.pixiApp.canvas.style.cursor = "crosshair";

    // Iniciamos el intervalo para crear conejitos cada 1 segundo (1000ms)
    // Usamos arrow function () => para no perder el 'this'
    setInterval(() => {
      this.generarConejitoEnemigo();
    }, 800);

    // Agregamos el Game Loop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    // Mouse (opcional si ya no lo persiguen, pero útil dejarlo)
    this.agregarInteractividadDelMouse();
    // NUEVO: Escuchar el clic para disparar
    // Usamos 'pointerdown' que funciona para mouse y toque en pantallas tactiles
    this.pixiApp.stage.eventMode = 'static';
    this.pixiApp.stage.hitArea = this.pixiApp.screen;
    this.pixiApp.stage.on('pointerdown', (e) => this.disparar(e));
    
    // OPCIONAL: Cambiar el cursor a una mira (crosshair)
    this.pixiApp.canvas.style.cursor = "crosshair";
  }

  generarConejitoEnemigo() {
    if (!this.animacionesPersonaje1) return;

    const saleDeIzquierda = Math.random() > 0.5;
    
    // MARGENES: Definimos un padding para que no salgan cortados arriba o abajo
    const margenVertical = 80; 
    // Calculamos una Y aleatoria respetando los márgenes
    const y = Math.random() * (this.height - margenVertical * 2) + margenVertical;

    let x, objetivoX;

    if (saleDeIzquierda) {
      x = -50; // Nace a la izquierda
      objetivoX = this.width + 100; // Va a la derecha
    } else {
      x = this.width + 50; // Nace a la derecha
      objetivoX = -100; // Va a la izquierda
    }

    const conejito = new Conejito(this.animacionesPersonaje1, x, y, this);
    
    // IMPORTANTE: El objetivo tiene LA MISMA 'y' que el origen.
    // Esto garantiza que camine en línea recta horizontal.
    conejito.asignarTarget({ posicion: { x: objetivoX, y: y } });
    
    // Ajustamos velocidad para que sea un reto (puedes variarlo)
    conejito.velocidadMaxima = 3; 
    conejito.distanciaParaLlegar = 10; 

    this.conejitos.push(conejito);
  }

  agregarInteractividadDelMouse() {
    this.pixiApp.canvas.onmousemove = (event) => {
      // Ajuste simple para coordenadas relativas al canvas si fuera necesario
      // pero con tu css actual event.x suele funcionar bien si el canvas está en 0,0
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  gameLoop(time) {
    // Iteramos al revés para poder borrar elementos sin romper el loop
    for (let i = this.conejitos.length - 1; i >= 0; i--) {
      const unConejito = this.conejitos[i];

      unConejito.tick();
      unConejito.render();

      // Limpieza: si se salen mucho del margen, los borramos
      if (unConejito.posicion.x < -100 || unConejito.posicion.x > this.width + 100) {
        this.pixiApp.stage.removeChild(unConejito.container);
        this.conejitos.splice(i, 1);
      }
    }
  }

  // Métodos viejos que quizás ya no uses, pero no molestan si se quedan
  getConejitoRandom() {
    return this.conejitos[Math.floor(this.conejitos.length * Math.random())];
  }
  disparar(evento) {
    // Obtenemos la posición del clic global
    const clickPos = evento.global;

    // Recorremos el array al revés para poder borrar sin romper el loop
    for (let i = this.conejitos.length - 1; i >= 0; i--) {
      const cone = this.conejitos[i];

      // Calculamos distancia entre el clic y el centro del conejo
      // Usamos tu función utilitaria 'calcularDistancia'
      // Nota: clickPos tiene x e y, cone.posicion también.
      const distancia = calcularDistancia(clickPos, cone.posicion);

      // Si la distancia es menor al radio del conejo (aprox 30-40px visualmente)
      // Ajusta este valor 40 según qué tan grande se vea tu sprite
      const radioHitbox = 80; 

      if (distancia < radioHitbox) {
        
        // --- NUEVO: SUMAR PUNTOS ---
        this.score++; 
        // Actualizamos el texto en pantalla
        this.scoreText.text = "Puntos: " + this.score;
        // ---------------------------

        console.log("Conejo eliminado! Total: " + this.score);

        this.pixiApp.stage.removeChild(cone.container);
        this.conejitos.splice(i, 1);
        
        // Efecto visual extra: Hacemos que el texto "salte" un poco al sumar
        // (Opcional, pero queda bonito)
        this.scoreText.scale.set(1.5);
        setTimeout(() => this.scoreText.scale.set(1), 100);

        break;
      }
    }
  }
}