class Tienda extends objetoEstatico {
    valorTiempo;
    valorCalidad;
    valorDinero;

    constructor(SprteSheetOBJ, xInicial, yInicial, zInicial, juegoEnElQueEstoy, valorTiempo, valorCalidad, valorDinero) {
        console.log(SprteSheetOBJ)
        super(SprteSheetOBJ, xInicial, yInicial, zInicial, juegoEnElQueEstoy);
        this.valorTiempo = valorTiempo;
        this.valorCalidad = valorCalidad;
        this.valorDinero = valorDinero;
        this.render(xInicial, yInicial, zInicial)
        //console.log("Construida la tienda")
    }

}