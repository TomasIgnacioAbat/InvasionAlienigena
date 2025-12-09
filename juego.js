class Juego {
  pixiApp;
  conejitos = [];
  // Nuevo array para las partículas de explosión
  particulas = [];
  width;
  height;
  animacionesPersonaje1; 
  score = 0;
  scoreText;
  tiempoInicio;
  timerText;
  
  gestorOleadas;
  tiempoHastaSiguienteSpawn = 0; 
  
  // Propiedades de Audio
  musicaFondo;
  sonidoDisparo;
  sonidoGameOver;
  sonidoVictoria;

  constructor() {
    this.width = 1280;
    this.height = 720;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }

  async initPIXI() {
    this.pixiApp = new PIXI.Application();

    this.pixiApp.stage.name = "el stage";
    this.pixiApp.stage.sortableChildren = true;
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

    // --- FONDO ---
    // Intenta cargar fondo.png, si no existe no pasa nada (catch)
    try {
        const texturaFondo = await PIXI.Assets.load("img/fondo.png");
        const fondo = new PIXI.Sprite(texturaFondo);
        fondo.width = this.width;
        fondo.height = this.height;
        fondo.zIndex = -1000; 
        this.pixiApp.stage.addChild(fondo);
    } catch (e) {
        console.log("No se encontró img/fondo.png, usando color base.");
    }

    const texture = await PIXI.Assets.load("bunny.png");
    this.animacionesPersonaje1 = await PIXI.Assets.load("img/personaje.json");

    // UI - TEXTOS
    const estiloTexto = new PIXI.TextStyle({
        fontFamily: 'Arial', fontSize: 36, fontWeight: 'bold',
        fill: '#ffffff', stroke: '#000000', strokeThickness: 4,
        dropShadow: true, dropShadowBlur: 4, dropShadowDistance: 6,
    });
    this.scoreText = new PIXI.Text({ text: 'Puntos: 0', style: estiloTexto });
    this.scoreText.x = 20;
    this.scoreText.y = 20;
    this.scoreText.zIndex = 8000; // UI Arriba
    this.pixiApp.stage.addChild(this.scoreText);

    const estiloTimer = new PIXI.TextStyle({
        fontFamily: 'Arial', fontSize: 36, fontWeight: 'bold',
        fill: '#FFD700', stroke: '#000000', strokeThickness: 4,
        dropShadow: true, dropShadowBlur: 4, dropShadowDistance: 6,
    });
    this.timerText = new PIXI.Text({ text: '00:00', style: estiloTimer });
    this.timerText.anchor.set(0.5, 0); 
    this.timerText.x = this.width / 2;
    this.timerText.y = 20; 
    this.timerText.zIndex = 8000; 
    this.pixiApp.stage.addChild(this.timerText);

    this.vidas = 20; 
    const estiloVidas = new PIXI.TextStyle({
        fontFamily: 'Arial', fontSize: 36, fontWeight: 'bold',
        fill: '#ff4444', stroke: '#000000', strokeThickness: 4,
        dropShadow: true, dropShadowBlur: 4,
    });
    this.vidasText = new PIXI.Text({ text: 'Vidas: ' + this.vidas, style: estiloVidas });
    this.vidasText.anchor.set(1, 0); 
    this.vidasText.x = this.width - 20; 
    this.vidasText.y = 20; 
    this.vidasText.zIndex = 8000; 
    this.pixiApp.stage.addChild(this.vidasText);
    
    this.tiempoInicio = Date.now();

    // --- AUDIO ---
    // Ajustamos la música según tu indicación
    this.musicaFondo = new Audio('sounds/musica.mp3');
    this.musicaFondo.loop = false; // <--- CAMBIO: NO BUCLE
    this.musicaFondo.volume = 0.1;

    this.sonidoDisparo = new Audio('sounds/disparo.mp3');
    this.sonidoDisparo.volume = 0.01; 

    this.sonidoGameOver = new Audio('sounds/gameover.mp3');
    this.sonidoGameOver.volume = 0.6;

    this.sonidoVictoria = new Audio('sounds/victoria.mp3')
    this.sonidoVictoria.volume = 0.6;

    // Iniciar música al primer click
    window.addEventListener('click', () => {
        if (this.musicaFondo.paused && this.gestorOleadas.estadoActual !== "VICTORIA") {
            this.musicaFondo.play().catch(e => console.log("Esperando interacción para audio"));
        }
    }, { once: true });


    // GESTOR
    this.gestorOleadas = new GestorDeOleadas(this);

    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    this.agregarInteractividadDelMouse();
    
    this.pixiApp.stage.eventMode = 'static';
    this.pixiApp.stage.hitArea = this.pixiApp.screen;
    this.pixiApp.stage.on('pointerdown', (e) => this.disparar(e));
    
    this.pixiApp.canvas.style.cursor = "crosshair";

    window.addEventListener("keydown", (e) => {
        if ((e.key === "r" || e.key === "R") && this.gestorOleadas.estadoActual === "VICTORIA") {
            this.reiniciarJuego();
        }
    });
  }

  agregarInteractividadDelMouse() {
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.posicion = { x: event.x, y: event.y };
    };
  }

  gameLoop(ticker) {
    const deltaSeconds = ticker.elapsedMS / 1000;
    const deltaFrame = ticker.deltaTime; // Usamos esto para partículas suaves

    // 1. Reloj
    if (this.tiempoInicio && this.gestorOleadas.estadoActual !== "VICTORIA") {
        const ahora = Date.now();
        const diferencia = ahora - this.tiempoInicio;
        const totalSegundos = Math.floor(diferencia / 1000);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;
        this.timerText.text = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    // 2. Gestor
    this.gestorOleadas.actualizar(deltaSeconds);

    // 3. Spawn
    if (this.gestorOleadas.estadoActual !== "VICTORIA") {
        this.tiempoHastaSiguienteSpawn -= ticker.elapsedMS;
        if (this.tiempoHastaSiguienteSpawn <= 0) {
            this.generarGrupoEnemigo();
            this.tiempoHastaSiguienteSpawn = this.gestorOleadas.tiempoEntreOleadas;
        }
    }

    // 4. Movimiento Aliens
    if (this.gestorOleadas.estadoActual !== "VICTORIA") { 
        
        for (let i = this.conejitos.length - 1; i >= 0; i--) {
          const unConejito = this.conejitos[i];
          unConejito.tick();
          unConejito.render();
    
          const vaHaciaDerecha = unConejito.velocidad.x > 0;
          const vaHaciaIzquierda = unConejito.velocidad.x < 0;
          const escapoPorDerecha = vaHaciaDerecha && unConejito.posicion.x > this.width + 100;
          const escapoPorIzquierda = vaHaciaIzquierda && unConejito.posicion.x < -100;
    
          if (escapoPorDerecha || escapoPorIzquierda) {
            if (this.gestorOleadas.estadoActual !== "VICTORIA" && this.vidas > 0) {
                this.restarVida();
            }
            this.pixiApp.stage.removeChild(unConejito.container);
            this.conejitos.splice(i, 1);
            continue; 
          }
        }
    }

    // 5. ACTUALIZAR PARTÍCULAS (EXPLOSIONES) - Esto corre siempre, incluso en Game Over
    for (let i = this.particulas.length - 1; i >= 0; i--) {
        const p = this.particulas[i];
        
        // Mover partícula
        p.x += p.vx * deltaFrame;
        p.y += p.vy * deltaFrame;
        
        // Reducir opacidad (Desvanecer)
        p.alpha -= 0.03 * deltaFrame;
        
        // Rotar un poco para efecto visual
        p.rotation += 0.1 * deltaFrame;

        // Si es invisible, borrar
        if (p.alpha <= 0) {
            this.pixiApp.stage.removeChild(p);
            this.particulas.splice(i, 1);
        }
    }
  }

  // --- NUEVO: SISTEMA DE EXPLOSIONES ---
  crearExplosion(x, y) {
    // Creamos 8 partículas por explosión
    for (let i = 0; i < 8; i++) {
        // Creamos un gráfico simple (cuadrado pequeño)
        const particula = new PIXI.Graphics();
        
        // Color: Verde Alien (#00ff00) o Sangre (#aa0000). Usamos Verde.
        particula.rect(0, 0, 8, 8); 
        particula.fill(0x33ff33);
        
        particula.x = x;
        particula.y = y;
        
        // Velocidad aleatoria en todas direcciones
        particula.vx = (Math.random() - 0.5) * 10; 
        particula.vy = (Math.random() - 0.5) * 10;
        
        particula.zIndex = 5000; // Por encima de los aliens
        
        this.pixiApp.stage.addChild(particula);
        this.particulas.push(particula);
    }
  }

  victoria() {
    console.log("¡SOBREVIVISTE!");
    
    this.gestorOleadas.estadoActual = "VICTORIA"; 
    this.musicaFondo.pause();
    this.musicaFondo.currentTime = 0;
    this.sonidoVictoria.play().catch(e => console.log("Falta archivo victoria"));
    
    // Si tienes sonido de victoria, ponlo aquí. Si no, silencio.
    // this.sonidoVictoria.play(); 

    const estiloVictoria = new PIXI.TextStyle({
        fontFamily: 'Arial Black', fontSize: 80, fontWeight: 'bold',
        fill: '#00ff99', 
        stroke: '#004400', strokeThickness: 8,
        dropShadow: true, dropShadowBlur: 20,
    });
    
    this.textoResultado = new PIXI.Text({ text: '¡SOBREVIVISTE!', style: estiloVictoria });
    this.textoResultado.anchor.set(0.5);
    this.textoResultado.x = this.width / 2;
    this.textoResultado.y = this.height / 2;
    this.textoResultado.zIndex = 9000; 

    this.pixiApp.stage.addChild(this.textoResultado);

    // Al ganar, explotamos a todos los aliens restantes
    for (let cone of this.conejitos) {
        this.crearExplosion(cone.posicion.x, cone.posicion.y);
        this.pixiApp.stage.removeChild(cone.container);
    }
    this.conejitos = [];

    this.mostrarMensajeReiniciar();
  }

  restarVida() {
    this.vidas--;
    this.vidasText.text = 'Vidas: ' + this.vidas;
    
    this.vidasText.style.fill = '#ffffff';
    setTimeout(() => { this.vidasText.style.fill = '#ff4444'; }, 100);

    if (this.vidas <= 0) {
        this.derrota();
    }
  }

  derrota() {
    console.log("¡HAS PERDIDO!");

    this.gestorOleadas.estadoActual = "VICTORIA"; 
    
    this.musicaFondo.pause();
    this.musicaFondo.currentTime = 0;
    this.sonidoGameOver.play().catch(e => console.log("Falta archivo gameover"));

    const estiloDerrota = new PIXI.TextStyle({
        fontFamily: 'Arial Black', fontSize: 80, fontWeight: 'bold',
        fill: '#ff0000', 
        stroke: '#ffffff', strokeThickness: 6,
        dropShadow: true, dropShadowBlur: 20,
    });
    
    this.textoResultado = new PIXI.Text({ text: 'GAME OVER', style: estiloDerrota });
    this.textoResultado.anchor.set(0.5);
    this.textoResultado.x = this.width / 2;
    this.textoResultado.y = this.height / 2;
    this.textoResultado.zIndex = 9000; 
    
    this.pixiApp.stage.addChild(this.textoResultado);

    this.mostrarMensajeReiniciar();
  }

  mostrarMensajeReiniciar() {
    const estiloR = new PIXI.TextStyle({
        fontFamily: 'Arial', fontSize: 30, fontWeight: 'bold',
        fill: '#ffffff', stroke: '#000000', strokeThickness: 4,
    });

    this.textoReiniciar = new PIXI.Text({ text: "Presiona 'R' para reiniciar", style: estiloR });
    this.textoReiniciar.anchor.set(0.5);
    this.textoReiniciar.x = this.width / 2;
    this.textoReiniciar.y = (this.height / 2) + 80; 
    this.textoReiniciar.zIndex = 9001; 
    
    let alpha = 1;
    let direccion = -0.02;
    this.intervaloParpadeo = setInterval(() => {
        if (!this.textoReiniciar) { clearInterval(this.intervaloParpadeo); return; }
        alpha += direccion;
        if (alpha <= 0.2 || alpha >= 1) direccion *= -1;
        this.textoReiniciar.alpha = alpha;
    }, 16);

    this.pixiApp.stage.addChild(this.textoReiniciar);
  }

  disparar(evento) {
    if (this.gestorOleadas.estadoActual === "VICTORIA") return;

    // SONIDO
    const sonidoClone = this.sonidoDisparo.cloneNode();
    sonidoClone.volume = 0.2;
    sonidoClone.play().catch(e => {});

    const clickPos = evento.global;
    let muertosEnEsteTiro = 0;

    for (let i = this.conejitos.length - 1; i >= 0; i--) {
      const cone = this.conejitos[i];
      const distancia = calcularDistancia(clickPos, cone.posicion);
      const radioHitbox = 100; 

      if (distancia < radioHitbox) {
        this.score++; 
        muertosEnEsteTiro++;
        
        // --- EFECTO DE MUERTE ---
        this.crearExplosion(cone.posicion.x, cone.posicion.y);
        // ------------------------

        this.pixiApp.stage.removeChild(cone.container);
        this.conejitos.splice(i, 1);
      }
    }

    if (muertosEnEsteTiro > 0) {
       this.scoreText.text = "Puntos: " + this.score;
       this.scoreText.scale.set(1.5);
       setTimeout(() => this.scoreText.scale.set(1), 100);
    }
  }

  generarGrupoEnemigo() {
    if (!this.animacionesPersonaje1) return;

    const saleDeIzquierda = Math.random() > 0.5;
    const margenVertical = 180;
    const alturaBase = Math.random() * (this.height - margenVertical * 2) + margenVertical;
    const cantidad = Math.floor(Math.random() * (5 - 3 + 1) + 3);

    let baseX, objetivoXBase;

    if (saleDeIzquierda) {
      baseX = -50; 
      objetivoXBase = this.width + 100;
    } else {
      baseX = this.width + 50; 
      objetivoXBase = -100; 
    }

    for (let i = 0; i < cantidad; i++) {
      const desfaseX = Math.random() * 150; 
      const desfaseY = (Math.random() * 80) - 40; 

      const spawnX = saleDeIzquierda ? (baseX - desfaseX) : (baseX + desfaseX);
      const spawnY = alturaBase + desfaseY;

      const conejito = new Conejito(this.animacionesPersonaje1, spawnX, spawnY, this);
      
      conejito.velocidad.x = saleDeIzquierda ? 1 : -1;
      conejito.velocidad.y = 0;
      
      conejito.asignarTarget({ posicion: { x: objetivoXBase, y: spawnY } });
      
      const velocidadBase = 2.5 + Math.random();
      conejito.velocidadMaxima = velocidadBase * this.gestorOleadas.multiplicadorVelocidad; 
      conejito.distanciaParaLlegar = 10; 

      this.conejitos.push(conejito);
    }
  }

  reiniciarJuego() {
    if (this.textoResultado) {
        this.pixiApp.stage.removeChild(this.textoResultado);
        this.textoResultado = null;
    }
    if (this.textoReiniciar) {
        this.pixiApp.stage.removeChild(this.textoReiniciar);
        this.textoReiniciar = null;
    }
    if (this.intervaloParpadeo) clearInterval(this.intervaloParpadeo);

    for (let cone of this.conejitos) {
        this.pixiApp.stage.removeChild(cone.container);
    }
    this.conejitos = [];

    // Limpiar partículas también
    for (let p of this.particulas) {
        this.pixiApp.stage.removeChild(p);
    }
    this.particulas = [];

    this.score = 0;
    this.vidas = 20;
    this.tiempoInicio = Date.now();
    this.tiempoHastaSiguienteSpawn = 0;

    this.scoreText.text = 'Puntos: 0';
    this.vidasText.text = 'Vidas: ' + this.vidas;
    this.timerText.text = '00:00';
    this.vidasText.style.fill = '#ff4444'; 
    
    // Resetear audio
    this.sonidoGameOver.pause();
    this.sonidoGameOver.currentTime = 0;
    this.musicaFondo.currentTime = 0;
    this.musicaFondo.play().catch(e=>{});

    this.gestorOleadas.reiniciar();
    this.pixiApp.ticker.start();
  }
}