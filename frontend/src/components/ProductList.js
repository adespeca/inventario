import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../AuthContext";
import { format, parseISO } from "date-fns";

const ProductList = ({ products, onDeleteProduct, setProducts }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [startDate, setStartDate] = useState(""); // Fecha inicial del filtro
  const [endDate, setEndDate] = useState(""); // Fecha final del filtro
  const { role } = useAuth(); // Obtén el rol del usuario
  const [editProduct, setEditProduct] = useState(null); // Estado para el producto que se edita
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);

      setEditProduct((prev) => ({
        ...prev,
        image: file, // Adjuntar el archivo al producto
      }));
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/products/${selectedProduct._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el producto");
        }

        // Llama a la función pasada desde el componente padre para actualizar productos
        onDeleteProduct();
        handleCloseDialog();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
    }
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setImagePreview(product.image); // Establecer la imagen actual en la vista previa
  };

  const handleCloseEditDialog = () => {
    setEditProduct(null);
    setImagePreview(null); // Limpiar la vista previa al cerrar el diálogo
  };

  const handleSaveEdit = async () => {
    if (editProduct) {
      try {
        // Crear una instancia de FormData
        const formData = new FormData();
  
        // Añadir los datos del producto al FormData
        formData.append("name", editProduct.name);
        formData.append("price", editProduct.price);
        formData.append("quantity", editProduct.quantity);
        formData.append("category", editProduct.category);
        formData.append("sales", editProduct.sales);
        formData.append("provider", editProduct.provider);
  
        // Si se seleccionó una nueva imagen, agregarla al FormData
        if (editProduct.image && editProduct.image instanceof File) {
          formData.append("image", editProduct.image); // El archivo seleccionado
        }
  
        // Realizar la solicitud PUT al servidor
        const response = await fetch(`http://127.0.0.1:5000/api/products/${editProduct._id}`, {
          method: "PUT",
          body: formData, // Enviar el FormData directamente
        });
  
        if (!response.ok) {
          throw new Error("Error al editar el producto");
        }
  
        const updatedProduct = await response.json();
  
        // Actualizar la lista de productos en el componente padre
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product
          )
        );
  
        // Cerrar el cuadro de diálogo de edición
        handleCloseEditDialog();
      } catch (error) {
        console.error("Error al editar el producto:", error);
      }
    }
  };

  // Filtrar productos por rango de fecha
  const filteredProducts = products.filter((product) => {
    const productDate = new Date(product.dateAdded);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && productDate < start) return false;
    if (end && productDate > end) return false;
    return true;
  });

  const isAdmin = role === "admin";

  return (
    <div>
      <Grid container spacing={4} style={{ marginTop: "20px" }}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card
              sx={{
                backgroundColor: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
                  {product.name}
                </Typography>
                <Typography color="textSecondary" sx={{ marginBottom: "8px" }}>
                  <strong>Precio:</strong> ${Number(product.price).toFixed(2) || "N/A"}
                </Typography>
                <Typography
                  color={product.quantity < 5 ? "error" : "textSecondary"}
                  sx={{ marginBottom: "8px" }}
                >
                  <strong>Cantidad en Inventario:</strong> {product.quantity}
                </Typography>
                <Typography color="textSecondary" sx={{ marginBottom: "8px" }}>
                  <strong>Cantidad Vendida:</strong> {product.sales || 0}
                </Typography>
                <Typography color="textSecondary" sx={{ marginBottom: "8px" }}>
                  <strong>Proveedor:</strong> {product.provider || "N/A"}
                </Typography>
                <Typography color="textSecondary" sx={{ marginBottom: "16px" }}>
                  <strong>Categoría:</strong> {product.category || "N/A"}
                </Typography>
                <Typography color="textSecondary" sx={{ marginBottom: "8px" }}>
                  <strong>Fecha Agregado:</strong>{" "}
                  {format(parseISO(product.dateAdded), "dd/MM/yyyy")}
                </Typography>
                <img
                  src={product.image}
                  alt="Vista previa"
                  style={{ maxWidth: "200px", height: "auto", marginTop: "10px" }}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between" }}>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  disabled={!isAdmin}
                  onClick={() => handleEditClick(product)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => handleDeleteClick(product)}
                  variant="outlined"
                  disabled={!isAdmin}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de confirmación para eliminar producto */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Estás seguro de que deseas eliminar el producto{" "}
            <strong>{selectedProduct?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar el producto */}
      <Dialog open={!!editProduct} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          {editProduct && (
            <>
              <TextField
                label="Nombre"
                fullWidth
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Precio"
                type="number"
                fullWidth
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Cantidad"
                type="number"
                fullWidth
                value={editProduct.quantity}
                onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Cantidad Vendida"
                type="number"
                fullWidth
                value={editProduct.sales}
                onChange={(e) => setEditProduct({ ...editProduct, sales: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Proveedor"
                fullWidth
                value={editProduct.provider}
                onChange={(e) => setEditProduct({ ...editProduct, provider: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Categoría</InputLabel>
                <Select
                  label="Categoría"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                >
                  <MenuItem value="herramienta">herramienta</MenuItem>
                  <MenuItem value="plomeria">plomeria</MenuItem>
                  <MenuItem value="bombillos">bombillos</MenuItem>
                </Select>
              </FormControl>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="secondary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductList;
