// 1. Crear la aplicación de Pixi
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb, // Formato hexadecimal 0xRRGGBB
    resolution: window.devicePixelRatio || 1, // Para pantallas retina/móviles nítidas
});

// 2. Añadir el canvas de Pixi al HTML
document.body.appendChild(app.view);

// 3. Crear un objeto (Sprite o Gráfico)
// Vamos a crear un cuadrado simple por ahora
const cuadrado = new PIXI.Graphics();
cuadrado.beginFill(0xFF0000); // Color rojo
cuadrado.drawRect(0, 0, 50, 50); // x, y, ancho, alto (relativo al centro del cuadrado)
cuadrado.endFill();

// Centramos el punto de anclaje (pivot) del cuadrado para que rote sobre su centro
cuadrado.pivot.set(25, 25);

// Colocamos el cuadrado en el centro de la pantalla
cuadrado.x = app.screen.width / 2;
cuadrado.y = app.screen.height / 2;

// 4. Añadir el objeto al "Escenario" (Stage)
// El stage es el contenedor principal de Pixi
app.stage.addChild(cuadrado);

// 5. El Bucle de Juego (Game Loop)
// Pixi usa "app.ticker" para ejecutar código cada frame
app.ticker.add((delta) => {
    // delta es el tiempo que pasó entre frames (para suavizar movimiento)
    
    // Rotar el cuadrado
    cuadrado.rotation += 0.05 * delta;
});