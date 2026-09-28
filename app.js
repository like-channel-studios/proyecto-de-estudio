// 1. Configuración de la API (¡No la subas a GitHub con tu clave real!)
const API_KEY = "mi API_KEY"; 
const URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/**
 * 2. Función principal que se comunica con la IA
 * @param {string} nombreProducto - El producto que el usuario escribió
 */
async function analizarProducto(nombreProducto) {
    // Le decimos a la IA exactamente qué queremos y en qué formato (JSON)
    const prompt = `
    Analiza el producto: "${nombreProducto}". 
    Eres un experto en el mercado venezolano. Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto adicional ni formato markdown:
    {
        "nombre": "Nombre formal del producto",
        "categoria": "Electrónico, Mueble, Vehículo, Ropa, etc.",
        "precioAproximado": "Precio estimado en dólares (Ej: $150 - $200)",
        "coloresComunes": ["color1", "color2"],
        "zonasCaracas": ["Zona 1 (ej. Sabana Grande, Las Mercedes)", "Zona 2", "Nombre de tienda conocida si aplica"]
    }`;

    // Configuramos la petición que enviaremos a la API
    const peticion = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        console.log("Buscando información de:", nombreProducto, "...");
        
        // Hacemos la llamada a la API
        const respuesta = await fetch(URL_GEMINI, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(peticion)
        });

        const datos = await respuesta.json();
        
        // Extraemos el texto que nos devolvió la IA
        let textoIA = datos.candidates[0].content.parts[0].text;
        
        // Limpiamos el texto por si la IA le pone comillas raras o formato de código
        textoIA = textoIA.replace(/```json/g, '').replace(/```/g, '').trim();

        // Convertimos el texto a un objeto de JavaScript real
        const productoAnalizado = JSON.parse(textoIA);
        
        return productoAnalizado; // Retornamos los datos limpios

    } catch (error) {
        console.error("Error al consultar a la IA:", error);
        return null;
    }
}
/**
 * 3. Función para mostrar los datos en el HTML
 * Esta función es la que adaptarán cuando junten el código.
 */
async function procesarBusqueda(productoInputId, resultadoContainerId) {
    // Buscamos lo que escribió el usuario (asumimos que tu amigo le pondrá un ID)
    const inputElement = document.getElementById(productoInputId);
    const contenedorResultados = document.getElementById(resultadoContainerId);

    if (!inputElement || inputElement.value === "") {
        alert("Por favor, ingresa un producto.");
        return;
    }

    // Mostramos un mensaje de carga
    contenedorResultados.innerHTML = "<p>Analizando el producto con IA... (Buscando en Caracas) ⏳</p>";

    // Llamamos a la función del Paso 2
    const datosDelProducto = await analizarProducto(inputElement.value);

    // Cuando la IA responda, inyectamos el HTML
    if (datosDelProducto) {
        contenedorResultados.innerHTML = `
            <h3>Resultados para: ${datosDelProducto.nombre}</h3>
            <ul>
                <li><strong>Categoría:</strong> ${datosDelProducto.categoria}</li>
                <li><strong>Precio Estimado:</strong> ${datosDelProducto.precioAproximado}</li>
                <li><strong>Colores:</strong> ${datosDelProducto.coloresComunes.join(', ')}</li>
                <li><strong>¿Dónde comprar en Caracas?:</strong> 
                    <ul>
                        ${datosDelProducto.zonasCaracas.map(zona => `<li>📍 ${zona}</li>`).join('')}
                    </ul>
                </li>
            </ul>
        `;
    } else {
        contenedorResultados.innerHTML = "<p>Hubo un error analizando el producto. Intenta de nuevo.</p>";
    }
}