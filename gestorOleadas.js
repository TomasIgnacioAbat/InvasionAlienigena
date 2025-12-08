class GestorDeOleadas {
  juego;
  tiempoTranscurrido = 0;
  
  // Estados posibles: NORMAL, RAPIDO, FRENESI, VICTORIA
  estadoActual = "NORMAL";

  // Factores de dificultad
  multiplicadorVelocidad = 1.0;
  tiempoEntreOleadas = 1000; // ms (Empieza con tu valor actual)
  
  // Texto para avisar al jugador del cambio de fase
  avisoFaseText;

  constructor(juego) {
    this.juego = juego;
    this.inicializarTextoAviso();
  }

  inicializarTextoAviso() {
    const estilo = new PIXI.TextStyle({
      fontFamily: 'Arial', fontSize: 50, fontWeight: 'bold',
      fill: '#ff0000', // Un solo color rojo (ESTO FUNCIONA)
      stroke: '#000000', strokeThickness: 5,
      dropShadow: true, dropShadowBlur: 10,
    });
    this.avisoFaseText = new PIXI.Text({ text: '', style: estilo });
    this.avisoFaseText.anchor.set(0.5);
    this.avisoFaseText.x = this.juego.width / 2;
    this.avisoFaseText.y = this.juego.height / 2;
    this.avisoFaseText.visible = false;
    this.juego.pixiApp.stage.addChild(this.avisoFaseText);
  }

  mostrarAviso(texto) {
    this.avisoFaseText.text = texto;
    this.avisoFaseText.visible = true;
    this.avisoFaseText.alpha = 1;
    
    // Efecto simple para desvanecer el texto en 3 segundos
    let fadeOut = setInterval(() => {
        this.avisoFaseText.alpha -= 0.05;
        if(this.avisoFaseText.alpha <= 0) {
            this.avisoFaseText.visible = false;
            clearInterval(fadeOut);
        }
    }, 100);
  }

  actualizar(deltaSeconds) {
    // Si ya ganamos, no hacemos nada más
    if (this.estadoActual === "VICTORIA") return;

    this.tiempoTranscurrido += deltaSeconds;

    // --- MÁQUINA DE ESTADOS FINITOS (FSM) ---

    // FASE 1: 0 a 30 segundos (NORMAL)
    if (this.tiempoTranscurrido < 30) {
        if (this.estadoActual !== "NORMAL") {
            this.estadoActual = "NORMAL";
            this.multiplicadorVelocidad = 1.0;
            console.log("Fase: Normal");
        }
    }
    // FASE 2: 30 a 60 segundos (RAPIDO +50%)
    else if (this.tiempoTranscurrido >= 30 && this.tiempoTranscurrido < 60) {
        if (this.estadoActual !== "RAPIDO") {
            this.estadoActual = "RAPIDO";
            this.multiplicadorVelocidad = 1.50; // 50% más rápido
            this.tiempoEntreOleadas = 1000; // Un poco más frecuente también
            this.mostrarAviso("¡ACELERACIÓN DETECTADA!");
            console.log("Fase: Rápida");
        }
    }
    // FASE 3: 60 a 90 segundos (FRENESI +50%)
    else if (this.tiempoTranscurrido >= 60 && this.tiempoTranscurrido < 90) {
        if (this.estadoActual !== "FRENESI") {
            this.estadoActual = "FRENESI";
            this.multiplicadorVelocidad = 2; // 100% más rápido
            this.tiempoEntreOleadas = 1000; // ¡Mucho más frecuente!
            this.mostrarAviso("¡VELOCIDAD MÁXIMA!");
            console.log("Fase: Frenesí");
        }
    }
    // FASE 4: > 90 segundos (VICTORIA)
    else if (this.tiempoTranscurrido >= 91) {
        if (this.estadoActual !== "VICTORIA") {
            this.estadoActual = "VICTORIA";
            this.juego.victoria(); // Llamamos al método de ganar en Juego
        }
    }
  }
  reiniciar() {
    this.tiempoTranscurrido = 0;
    this.estadoActual = "NORMAL";
    this.multiplicadorVelocidad = 1.0;
    this.tiempoEntreOleadas = 1000; // O el valor inicial que prefieras
    this.avisoFaseText.visible = false;
    console.log("Gestor reiniciado");
  }
}