class GestorDeOleadas {
  juego;
  tiempoTranscurrido = 0;
  
  // Estados posibles: NORMAL, RAPIDO, FRENESI, VICTORIA
  estadoActual = "NORMAL";

  // Factores de dificultad
  multiplicadorVelocidad = 1.0;
  tiempoEntreOleadas = 800; 
  
  avisoFaseText;

  constructor(juego) {
    this.juego = juego;
    this.inicializarTextoAviso();
  }

  inicializarTextoAviso() {
    const estilo = new PIXI.TextStyle({
      fontFamily: 'Arial', fontSize: 50, fontWeight: 'bold',
      fill: '#ff0000', 
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
    
    let fadeOut = setInterval(() => {
        if(!this.avisoFaseText) { clearInterval(fadeOut); return; }
        this.avisoFaseText.alpha -= 0.05;
        if(this.avisoFaseText.alpha <= 0) {
            this.avisoFaseText.visible = false;
            clearInterval(fadeOut);
        }
    }, 100);
  }

  // Método auxiliar para cambiar la velocidad de la música de forma segura
  ajustarMusica(velocidad) {
    if (this.juego.musicaFondo) {
        this.juego.musicaFondo.playbackRate = velocidad;
    }
  }

  actualizar(deltaSeconds) {
    if (this.estadoActual === "VICTORIA") return;

    this.tiempoTranscurrido += deltaSeconds;

    // FASE 1: NORMAL (0-30s)
    if (this.tiempoTranscurrido < 30) {
        if (this.estadoActual !== "NORMAL") {
            this.estadoActual = "NORMAL";
            this.multiplicadorVelocidad = 1.0;
            this.tiempoEntreOleadas = 800;
            
            // --- MUSICA NORMAL ---
            this.ajustarMusica(1.0); 
        }
    }
    // FASE 2: RAPIDO (30-60s)
    else if (this.tiempoTranscurrido >= 30 && this.tiempoTranscurrido < 60) {
        if (this.estadoActual !== "RAPIDO") {
            this.estadoActual = "RAPIDO";
            this.multiplicadorVelocidad = 1.5; 
            this.tiempoEntreOleadas = 700;
            this.mostrarAviso("¡ACELERACIÓN DETECTADA!");
            
            // --- MUSICA RAPIDA (1.1x) ---
            this.ajustarMusica(1.1); 
        }
    }
    // FASE 3: FRENESI (60-90s)
    else if (this.tiempoTranscurrido >= 60 && this.tiempoTranscurrido < 90) {
        if (this.estadoActual !== "FRENESI") {
            this.estadoActual = "FRENESI";
            this.multiplicadorVelocidad = 2; 
            this.tiempoEntreOleadas = 600; 
            this.mostrarAviso("¡VELOCIDAD MÁXIMA!");
            
            // --- MUSICA FRENÉTICA (1.2x) ---
            this.ajustarMusica(1.2); 
        }
    }
    // FASE 4: VICTORIA (>90s)
    else if (this.tiempoTranscurrido >= 91) {
        if (this.estadoActual !== "VICTORIA") {
            this.estadoActual = "VICTORIA";
            this.ajustarMusica(1.0); // Restaurar por si acaso (aunque se pausa luego)
            this.juego.victoria(); 
        }
    }
  }

  reiniciar() {
    this.tiempoTranscurrido = 0;
    this.estadoActual = "NORMAL";
    this.multiplicadorVelocidad = 1.0;
    this.tiempoEntreOleadas = 800; 
    this.avisoFaseText.visible = false;
    
    // --- RESETEAR MUSICA ---
    this.ajustarMusica(1.0);
    
    console.log("Gestor reiniciado");
  }
}