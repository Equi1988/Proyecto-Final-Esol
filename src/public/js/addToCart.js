document.getElementById("addToCartBtn").addEventListener("click", async () => {
    const cartId = document.getElementById("cartId").value.trim();
    const productId = document.getElementById("addToCartBtn").dataset.productId;

    if (!cartId) {
        alert("Por favor, ingresa un ID de carrito válido.");
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || "Algo salió mal."}`);
        } else {
            alert("Producto agregado al carrito con éxito.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error de conexión o en el servidor.");
    }
});