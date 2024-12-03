import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusIcon, ExclamationCircleIcon, CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';

const EmptyState = ({ message, icon: Icon }) => (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
  </div>
);

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  })
  const [dateFilter, setDateFilter] = useState('all'); // all, today, upcoming, past
  const [searchDate, setSearchDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/patients`)
      ]);
      
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      setError(error.message);
      toast.error('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${editingAppointment._id}`, formData);
        toast.success('Appointment updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments`, formData);
        toast.success('Appointment scheduled successfully');
      }
      setShowForm(false);
      setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
      setEditingAppointment(null);
      fetchData();
    } catch (error) {
      toast.error(editingAppointment ? 'Error updating appointment' : 'Error scheduling appointment');
    }
  };

  const fetchFilteredAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/appointments`;
      
      if (dateFilter === 'range' && searchDate) {
        const startDate = new Date(searchDate);
        const endDate = new Date(searchDate);
        endDate.setDate(endDate.getDate() + 1);
        url = `/api/appointments/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      const response = await axios.get(url);
      let filteredAppointments = response.data;

      if (dateFilter === 'today') {
        const today = new Date().toDateString();
        filteredAppointments = filteredAppointments.filter(
          app => new Date(app.date).toDateString() === today
        );
      } else if (dateFilter === 'upcoming') {
        const today = new Date();
        filteredAppointments = filteredAppointments.filter(
          app => new Date(app.date) > today
        );
      } else if (dateFilter === 'past') {
        const today = new Date();
        filteredAppointments = filteredAppointments.filter(
          app => new Date(app.date) < today
        );
      }

      setAppointments(filteredAppointments);
    } catch (error) {
      setError(error.message);
      toast.error('Error fetching appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/appointments/${id}/status`, { status });
      toast.success('Appointment status updated');
      fetchFilteredAppointments();
    } catch (error) {
      toast.error('Error updating appointment status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`);
        toast.success('Appointment deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting appointment');
      }
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      reason: appointment.reason
    });
    setShowForm(true);
  };

  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Schedule Appointment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule New Appointment</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <select
                  className="w-full p-2 border rounded"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
                <textarea
                  placeholder="Reason for visit"
                  className="w-full p-2 border rounded"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <select
          className="p-2 border rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Appointments</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="range">Search by Date</option>
        </select>
        
        {dateFilter === 'range' && (
          <input
            type="date"
            className="p-2 border rounded"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        )}
        
        <button
          onClick={fetchFilteredAppointments}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <EmptyState 
          message={`Error: ${error}`}
          icon={(props) => (
            <ExclamationCircleIcon {...props} className="text-red-500" />
          )}
        />
      ) : appointments.length === 0 ? (
        <EmptyState 
          message="No appointments found"
          icon={CalendarIcon}
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => {
                const patient = patients.find(p => p._id === appointment.patientId);
                const doctor = doctors.find(d => d._id === appointment.doctorId);
                
                return (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient ? patient.name : 'Unknown Patient'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor ? doctor.name : 'Unknown Doctor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs ${statusColors[appointment.status]}`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}