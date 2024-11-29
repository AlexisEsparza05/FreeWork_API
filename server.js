const express = require('express');
const cors= require('cors');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Cargar las variables de entorno

const app = express();
const port = 3000;


// Middleware 
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para login (ejemplo de autenticación)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.execute(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al consultar la base de datos' });
    }
    if (results.length > 0) {
      return res.status(200).json({ message: 'Login exitoso', user: results[0] });
    } else {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  });
});

  
  // Ruta para registro de usuario
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.execute(query, [email, password], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El email ya está registrado' });
      }
      return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  });
});

// Iniciar servidor
app.listen(port, 'localhost', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

