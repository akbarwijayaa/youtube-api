const express = require('express');
const axios = require('axios');
const cors = require('cors');  // Import paket CORS
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Tambahkan middleware CORS di sini
app.use(cors({
  origin: 'http://localhost:3000',  // Ijinkan akses dari frontend React (port 3000)
}));

// Endpoint untuk menangani pertukaran Authorization Code
app.post('/auth/google', async (req, res) => {
  const { code } = req.body;  // Mengambil authorization code dari frontend

  try {
    // Menukar authorization code dengan access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    // Mengirim response access token kembali ke frontend
    res.json(data);
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Menjalankan server pada port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
