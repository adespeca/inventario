import React, { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from "@mui/material";

const ProductManagement = ({ onProductAdded }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sales, setSales] = useState(0);
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState(null); // Estado para la imagen seleccionada
  const [provider, setProvider] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl); // Para la vista previa
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (price <= 0 || quantity <= 0 || !category) {
      setError("El precio, la cantidad y la categoría son obligatorios.");
      return;
    }

    // Crear un FormData para enviar los datos del producto y la imagen
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("sales", sales);
    formData.append("category", category);
    formData.append("provider", provider);

    // Verifica si la imagen está presente y la agrega al FormData
    if (image) {
      const file = document.getElementById("upload-button-file").files[0];
      formData.append("image", file);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/products", {
        method: "POST",
        body: formData, // Enviar el FormData con la imagen
      });

      if (!response.ok) {
        throw new Error("Error en la creación del producto");
      }

      const data = await response.json();
      console.log("Producto Agregado:", data);

      // Resetear el formulario después de agregar el producto
      setName("");
      setPrice("");
      setQuantity("");
      setSales(0);
      setProvider("");
      setCategory("");
      setImage(null);
      setError(null);
      setSuccess(true);

      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      setError(error.message);
      console.error("Error al agregar producto:", error);
    }
  };

  return (
    <form onSubmit={handleAddProduct}>
      <TextField
        label="Nombre del Producto"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Precio"
        type="number"
        variant="outlined"
        placeholder="Ej. 100.00"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: "0.01", step: "0.01" }}
      />
      <TextField
        label="Cantidad"
        type="number"
        variant="outlined"
        placeholder="Ej. 10"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: "1" }}
      />
      <TextField
        label="Cantidad Vendida"
        type="number"
        variant="outlined"
        placeholder="Ej. 5"
        value={sales}
        onChange={(e) => setSales(e.target.value)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: "0" }}
      />
      <TextField
        label="Proveedor"
        variant="outlined"
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        required
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Categoría</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Categoría"
          required
        >
          <MenuItem value="herramienta">herramienta</MenuItem>
          <MenuItem value="plomeriañ">plomeriañ</MenuItem>
          <MenuItem value="bombillos">bombillos</MenuItem>
        </Select>
      </FormControl>

      {/* Botón para cargar la imagen */}
      <Box textAlign="center" mt={2}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="upload-button-file"
          type="file"
          name="image"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-button-file">
          <Button variant="contained" color="secondary" component="span">
            Cargar Imagen
          </Button>
        </label>
        {image && (
          <Box mt={2}>
            <Typography variant="subtitle1">Vista Previa:</Typography>
            <img
              src={image}
              alt="Vista previa"
              style={{ maxWidth: "200px", height: "auto", marginTop: "10px" }}
            />
          </Box>
        )}
      </Box>

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Agregar Producto
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Producto agregado con éxito.
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default ProductManagement;
