class PersonaComprador extends Persona {
    importanciaTiempo;
    importanciaDinero;
    importanciaCalidad;
    puntajeDeTiendas = {};

    constructor(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy, importanciaTiempo, importanciaDinero, importanciaCalidad) {
        super(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy);
        this.setearImportancias(importanciaTiempo, importanciaDinero, importanciaCalidad)
        //this.asignarTarget()
    }

    tiendas() {
        return this.juego.tiendas;
    }

    setearImportancias(importanciaTiempo, importanciaDinero, importanciaCalidad) {
        this.importanciaTiempo = importanciaTiempo;
        this.importanciaDinero = importanciaDinero;
        this.importanciaCalidad = importanciaCalidad;
    }

    generarImportanciasAleatorias() {
        this.importanciaTiempo = Math.floor(Math.random() * 10) + 1;
        this.importanciaDinero = Math.floor(Math.random() * 10) + 1;
        this.importanciaCalidad = Math.floor(Math.random() * 10) + 1;
    }

    tiendaConElMejorPuntaje() {
        let puntajeMaximo = mayorValorDeUnDiccionario(this.puntajeDeTiendas);
        for (let tienda of Object.keys(this.puntajeDeTiendas())){
            if(this.puntajeDeTiendas[tienda] == puntajeMaximo){ 
                return this.juego.tiendas[tienda];
            }
        }
        console.log("No se encontró la tienda con el mejor puntaje");
        return;
    }

    juzgarTodasLastiendas() {
        for (let tienda of Object.keys(this.tiendas())){
            this.puntajeDeTiendas[tienda] = this.juzgarTienda(this.tiendas()[tienda]);
        }
    }

    juzgarTienda(unaTienda){
        const valorTiempo = this.juzgarCaracteristica(unaTienda.valorTiempo, this.importanciaTiempo); 
        const valorDinero = this.juzgarCaracteristica(unaTienda.valorDinero, this.importanciaDinero);
        const valorCalidad = this.juzgarCaracteristica(unaTienda.valorCalidad, this.importanciaCalidad);
        return valorCalidad + valorDinero + valorTiempo;
    }

  juzgarCaracteristica(valorDeTienda, valorPorPersonalidad){
        if (valorDeTienda >= valorPorPersonalidad){
            return valorDeTienda * valorPorPersonalidad;
        }
        else {
            return valorPorPersonalidad * (valorDeTienda - valorPorPersonalidad);
        }
    }
}