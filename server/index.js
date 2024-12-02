import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { Patient } from './models/Patient.js'
import { Doctor } from './models/Doctor.js'
import { Appointment } from './models/Appointment.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Configure MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000)
  }
}

connectDB()

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments()
    ])
    res.json({ totalPatients, totalDoctors, totalAppointments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Patient endpoints
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 })
    res.json(patients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body)
    await patient.save()
    res.status(201).json(patient)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Doctor endpoints
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 })
    res.json(doctors)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/doctors', async (req, res) => {
  try {
    const doctor = new Doctor(req.body)
    await doctor.save()
    res.status(201).json(doctor)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Appointment endpoints
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: 1, time: 1 })
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body)
    await appointment.save()
    res.status(201).json(appointment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get appointments by date range
app.get('/api/appointments/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard stats
app.get('/api/stats/detailed', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStats,
      todayAppointments,
      appointmentsByStatus,
      last7DaysAppointments
    ] = await Promise.all([
      Promise.all([
        Patient.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments()
      ]),
      Appointment.countDocuments({
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    res.json({
      totalPatients: totalStats[0],
      totalDoctors: totalStats[1],
      totalAppointments: totalStats[2],
      todayAppointments,
      appointmentsByStatus,
      last7DaysAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add these new endpoints

// Delete endpoints
app.delete('/api/patients/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    // Also delete related appointments
    await Appointment.deleteMany({ patientId: req.params.id });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    // Also delete related appointments
    await Appointment.deleteMany({ doctorId: req.params.id });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update endpoints
app.put('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})