class objetoEstatico extends GameObject {
  constructor(SprteSheetOBJ, xIncial, yIncial, zInicial, juegoEnElQueEstoy) {
    super(SprteSheetOBJ, xIncial, yIncial, juegoEnElQueEstoy);
    //this.cambiarAnimacion("imagen");
    this.render(xIncial, yIncial, zInicial);
  }

  render(posicionX, posicionY, posicionZ) {
    this.container.x = posicionX;
    this.container.y = posicionY;
    this.container.zIndex = posicionZ;
    //this.spritesAnimados["imagen"].scale.set(1);
  }

  tick() {}
}

