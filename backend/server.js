const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const User = require('./models/User');

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Seed default admin
    try {
      const adminExists = await User.findOne({ email: 'admin@taskmaster.com' });
      if (!adminExists) {
        await User.create({
          name: 'Admin',
          email: 'admin@taskmaster.com',
          password: 'adminpassword',
          role: 'admin'
        });
        console.log('Default Admin created: admin@taskmaster.com / adminpassword');
      }
    } catch (err) {
      console.error('Error seeding admin user:', err);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
