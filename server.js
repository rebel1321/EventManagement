import 'dotenv/config'

import express from 'express';
import { testConnection } from './config/db.js'; // Import the test function

const app = express();
const PORT = process.env.PORT || 3000;

testConnection();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Event Management API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
