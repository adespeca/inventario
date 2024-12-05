const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();
const port = 5000;

// Conectar a MongoDB (reemplaza 'your-mongodb-uri' con tu URI de conexión de MongoDB)
mongoose.connect('mongodb+srv://fernanda:12345mafe@cluster0.zt7w8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
  });

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dez951un6',
  api_key: '525595354989361',
  api_secret: '11ERXsL7pcgMopmv2OsqwMha6Sg'
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// Configuración de multer para manejar la carga de imágenes
const storage = multer.memoryStorage(); // Usar memoria temporal
const upload = multer({ storage: storage });

// Definir el esquema de producto
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  quantity: Number,
  category: String,
  sales: Number,
  provider: String,
  image: String,
  dateAdded: { type: Date, default: Date.now },
});

// Crear el modelo de producto
const Product = mongoose.model('Product', productSchema);

// Endpoint para agregar un producto
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, price, quantity, category, sales, provider } = req.body;
  const imageFile = req.file; // Obtén la imagen cargada desde la solicitud

  try {
    let imageUrl = '';

    if (imageFile) {
      // Subir la imagen directamente usando Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`, 
        { resource_type: 'image' }
      );
      imageUrl = result.secure_url; // URL de la imagen subida
    }

    // Crear un nuevo producto con la URL de la imagen de Cloudinary
    const newProduct = new Product({
      name,
      price,
      quantity,
      category,
      sales,
      provider,
      image: imageUrl,
    });

    // Guardar el producto en MongoDB
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

  } catch (error) {
    console.error('Error al agregar el producto:', error);
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

// Endpoint para obtener todos los productos con filtros
app.get('/api/products', async (req, res) => {
  const { category, dateAdded, stock } = req.query;
  try {
    let filter = {};
    // Filtro por categoría
    if (category) {
      filter.category = category;
    }
    // Filtro por fecha de creación
    if (dateAdded) {
      const [start, end] = dateAdded.split(',');
      if (start) {
        filter.dateAdded = { $gte: new Date(start) };
      }
      if (end) {
        filter.dateAdded = { $lte: new Date(end) };
      }
    }
    // Filtro por cantidad en stock
    if (stock) {
      filter.quantity = { $gte: parseInt(stock) };
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Endpoint para eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// Endpoint para actualizar un producto
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, category, sales, provider, image } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, quantity, category, sales, provider, image },
      { new: true } // Devuelve el producto actualizado
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
