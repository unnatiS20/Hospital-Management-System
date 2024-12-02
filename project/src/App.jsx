import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Patients from './components/Patients'
import Doctors from './components/Doctors'
import Appointments from './components/Appointments'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const views = {
    dashboard: <Dashboard />,
    patients: <Patients />,
    doctors: <Doctors />,
    appointments: <Appointments />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-8">
        {views[currentView]}
      </main>
    </div>
  )
}

export default App