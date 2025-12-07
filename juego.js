class Juego {
  pixiApp;
  conejitos = [];
  width;
  height;
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
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };

    await this.pixiApp.init(opcionesDePixi);
    document.body.appendChild(this.pixiApp.canvas);

    // Carga de assets
    const texture = await PIXI.Assets.load("bunny.png");
    this.animacionesPersonaje1 = await PIXI.Assets.load("img/Alienigena Guerrero.json");

    // Configuración del Texto de Puntaje
    const estiloTexto = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
    });

    this.scoreText = new PIXI.Text({ text: 'Puntos: 0', style: estiloTexto });
    this.scoreText.x = 20;
    this.scoreText.y = 20;
    this.pixiApp.stage.addChild(this.scoreText);

    // --- CONFIGURACIÓN DE APARICIÓN ---
    // Solo usamos este intervalo (el de grupo). Borré el otro que daba error.
    setInterval(() => {
      this.generarGrupoEnemigo();
    }, 600);

    // --- GAME LOOP ---
    // Solo se agrega UNA vez
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    // --- INTERACTIVIDAD ---
    this.agregarInteractividadDelMouse(); // Para actualizar la posición x,y del mouse
    
    // Configuración de eventos de clic (Disparo)
    this.pixiApp.stage.eventMode = 'static';
    this.pixiApp.stage.hitArea = this.pixiApp.screen;
    // Solo agregamos el evento una vez
    this.pixiApp.stage.on('pointerdown', (e) => this.disparar(e));
    
    this.pixiApp.canvas.style.cursor = "crosshair";
  }

  agregarInteractividadDelMouse() {
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  gameLoop(time) {
    for (let i = this.conejitos.length - 1; i >= 0; i--) {
      const unConejito = this.conejitos[i];

      unConejito.tick();
      unConejito.render();

      if (unConejito.posicion.x < -100 || unConejito.posicion.x > this.width + 100) {
        this.pixiApp.stage.removeChild(unConejito.container);
        this.conejitos.splice(i, 1);
      }
    }
  }

  disparar(evento) {
    const clickPos = evento.global;
    
    // Variable para saber si matamos a alguien en este clic (para efectos visuales)
    let muertosEnEsteTiro = 0;

    // Recorremos el array al revés
    for (let i = this.conejitos.length - 1; i >= 0; i--) {
      const cone = this.conejitos[i];
      const distancia = calcularDistancia(clickPos, cone.posicion);

      const radioHitbox = 80; 

      if (distancia < radioHitbox) {
        // ¡IMPACTO!
        this.score++; 
        muertosEnEsteTiro++;

        // Eliminamos al conejo (Visual y Lógico)
        this.pixiApp.stage.removeChild(cone.container);
        this.conejitos.splice(i, 1);
        
        // --- CAMBIO CLAVE: BORRAMOS EL 'break' ---
        // Al no poner 'break', el bucle sigue buscando más víctimas 
        // en la misma posición del clic.
      }
    }

    // Si hubo bajas en este clic, actualizamos el texto
    if (muertosEnEsteTiro > 0) {
       this.scoreText.text = "Puntos: " + this.score;
       
       console.log(`¡Masacre! Eliminaste a ${muertosEnEsteTiro} de un solo tiro.`);

       // Efecto de "salto" del texto para dar feedback
       this.scoreText.scale.set(1.5);
       setTimeout(() => this.scoreText.scale.set(1), 100);
    }
  }

  generarGrupoEnemigo() {
    if (!this.animacionesPersonaje1) return;

    const saleDeIzquierda = Math.random() > 0.5;
    const margenVertical = 180;
    const alturaBase = Math.random() * (this.height - margenVertical * 2) + margenVertical;
    
    const cantidad = Math.floor(Math.random() * (8 - 6 + 1) + 6);

    let baseX, objetivoXBase;

    if (saleDeIzquierda) {
      baseX = -50; 
      objetivoXBase = this.width + 100;
    } else {
      baseX = this.width + 50; 
      objetivoXBase = -100; 
    }

    for (let i = 0; i < cantidad; i++) {
      const desfaseX = Math.random() * 100; 
      const desfaseY = (Math.random() * 60) - 30; 

      const spawnX = saleDeIzquierda ? (baseX - desfaseX) : (baseX + desfaseX);
      const spawnY = alturaBase + desfaseY;

      const conejito = new Conejito(this.animacionesPersonaje1, spawnX, spawnY, this);
      
      conejito.asignarTarget({ posicion: { x: objetivoXBase, y: spawnY } });
      
      conejito.velocidadMaxima = 2.5 + Math.random();
      conejito.distanciaParaLlegar = 10; 

      this.conejitos.push(conejito);
    }
  }
  
  // Métodos viejos
  getConejitoRandom() {
    return this.conejitos[Math.floor(this.conejitos.length * Math.random())];
  }
}