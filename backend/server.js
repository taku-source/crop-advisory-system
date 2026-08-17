const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',                    require('./routes/auth'));
app.use('/api/users',                   require('./routes/users'));
app.use('/api/advisories',              require('./routes/advisories'));
app.use('/api/advisories-contextual',   require('./routes/advisoriesContextual'));
app.use('/api/diseases',                require('./routes/diseases'));
app.use('/api/diseases-symptom-match',  require('./routes/diseasesSymptomMatch'));
app.use('/api/farmers',                 require('./routes/farmers'));
app.use('/api/records',                 require('./routes/records'));
app.use('/api/notifications',           require('./routes/notifications'));
app.use('/api/reports',                 require('./routes/reports'));
app.use('/api/knowledge',               require('./routes/knowledge'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database & Server start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📄 Swagger docs available at http://localhost:${PORT}/api/docs`);
    });

    // ─── Scheduled Jobs ─────────────────────────────────────────────────────
    // Run every day at 7:00 AM — check for upcoming advisories and notify farmers
    cron.schedule('0 7 * * *', async () => {
      console.log('⏰ Running daily advisory reminder job...');
      const { sendAdvisoryReminders } = require('./controllers/notificationController');
      await sendAdvisoryReminders();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
