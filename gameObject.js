class GameObject {
  sprite;
  id;
  x = 0;
  y = 0;
  target;
  
  // PROPIEDADES SIMPLIFICADAS (Arcade)
  velocidadMaxima = 3; 
  velocidad = { x: 0, y: 0 };
  posicion = { x: 0, y: 0 };
  
  spritesAnimados = {};
  angulo = 0;
  velocidadLineal = 0;

  constructor(textureData, x, y, juego) {
    this.container = new PIXI.Container();
    this.container.name = "container";
    
    this.posicion = { x: x, y: y };
    this.juego = juego;
    this.id = Math.floor(Math.random() * 99999999);

    this.cargarSpritesAnimados(textureData);
    this.cambiarAnimacion("caminarAbajo");

    this.juego.pixiApp.stage.addChild(this.container);
  }

  cargarSpritesAnimados(textureData) {
    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );
      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.1;
      
      // Ajusta la escala (1.5 funciona bien para tus aliens)
      this.spritesAnimados[key].scale.set(1.5); 
      this.spritesAnimados[key].anchor.set(0.5, 1);
      this.container.addChild(this.spritesAnimados[key]);
    }
  }

  cambiarAnimacion(cual) {
    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
    }
    this.spritesAnimados[cual].visible = true;
  }

  asignarTarget(quien) {
    this.target = quien;
  }

  // --- CEREBRO LOBOTOMIZADO (Movimiento simple y directo) ---
  tick() {
    // 1. CALCULAR DIRECCIÓN
    if (this.target) {
        const dx = this.target.posicion.x - this.posicion.x;
        const dy = this.target.posicion.y - this.posicion.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Si estamos lejos, nos movemos.
        if (distancia > 5) {
            // Normalizamos el vector (dirección pura)
            const dirX = dx / distancia;
            const dirY = dy / distancia;

            // Asignamos velocidad directa. SIN ACELERACIÓN.
            this.velocidad.x = dirX * this.velocidadMaxima;
            this.velocidad.y = dirY * this.velocidadMaxima;
        }
    }

    // 2. EVITAR MUROS (Corrección simple en Y)
    // Solo si se van muy arriba o muy abajo
    const margenSeguridad = 50;
    const correccion = 1;

    if (this.posicion.y < margenSeguridad) {
        this.velocidad.y += correccion;
    } else if (this.posicion.y > this.juego.height - margenSeguridad) {
        this.velocidad.y -= correccion;
    }

    // 3. MOVER (Sumar velocidad a posición)
    const delta = this.juego.pixiApp.ticker.deltaTime;
    this.posicion.x += this.velocidad.x * delta;
    this.posicion.y += this.velocidad.y * delta;

    // 4. ACTUALIZAR ANIMACIÓN
    this.actualizarAnimacion();
  }

  actualizarAnimacion() {
    // Calculamos velocidad lineal para saber qué tan rápido mover las patas
    this.velocidadLineal = Math.sqrt(this.velocidad.x ** 2 + this.velocidad.y ** 2);
    
    // Calculamos el ángulo en grados (0 a 360)
    let anguloTemp = (Math.atan2(this.velocidad.y, this.velocidad.x) * (180 / Math.PI)) + 180;
    this.angulo = anguloTemp % 360; // Esto arregla el bug de "caminar abajo" a la izquierda

    const escala = 1.5; 
    let velocidadAnim = this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;

    // Lógica de Sprites (Según tu hoja de sprites)
    // IZQUIERDA (Tu sprite mira a la izq por defecto)
    if ((this.angulo > 315 || this.angulo < 45)) { 
        this.cambiarAnimacion("caminarDerecha");
        this.spritesAnimados.caminarDerecha.scale.x = escala; // Normal
    } 
    // DERECHA (Invertimos el sprite)
    else if (this.angulo > 135 && this.angulo < 225) { 
        this.cambiarAnimacion("caminarDerecha");
        this.spritesAnimados.caminarDerecha.scale.x = -escala; // Espejo
        velocidadAnim *= -1; // Corrección Moonwalk
    } 
    // ARRIBA
    else if (this.angulo >= 45 && this.angulo <= 135) { 
         this.cambiarAnimacion("caminarArriba");
         this.spritesAnimados.caminarArriba.scale.x = escala;
    } 
    // ABAJO
    else { 
         this.cambiarAnimacion("caminarAbajo");
         this.spritesAnimados.caminarAbajo.scale.x = escala;
    }

    // Aplicar velocidad de animación a todos los clips
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
        this.spritesAnimados[key].animationSpeed = velocidadAnim;
    }
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.posicion.y;
  }
}