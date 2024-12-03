import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LoadingState from './common/LoadingState'
import ErrorState from './common/ErrorState'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    contact: '',
    email: ''
  })

  const fetchDoctors = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`)
      setDoctors(response.data)
    } catch (error) {
      setError(error.message)
      toast.error('Error loading doctors')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDoctor) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/${editingDoctor._id}`, formData)
        toast.success('Doctor updated successfully')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/doctors`, formData)
        toast.success('Doctor added successfully')
      }
      setShowForm(false)
      setFormData({ name: '', specialization: '', experience: '', contact: '', email: '' })
      setEditingDoctor(null)
      fetchDoctors()
    } catch (error) {
      toast.error(editingDoctor ? 'Error updating doctor' : 'Error adding doctor')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor? All related appointments will also be deleted.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/doctors/${id}`)
        toast.success('Doctor deleted successfully')
        fetchDoctors()
      } catch (error) {
        toast.error('Error deleting doctor')
      }
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      contact: doctor.contact,
      email: doctor.email
    })
    setShowForm(true)
  }

  const EmptyState = () => (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by adding your first doctor.</p>
      <div className="mt-6">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Doctor
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingState message="Loading doctors..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDoctors} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.experience} years</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doctor._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Doctor</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Specialization"
                  className="w-full p-2 border rounded"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Years of Experience"
                  className="w-full p-2 border rounded"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Contact"
                  className="w-full p-2 border rounded"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}