import React from 'react'
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline'

const Sidebar = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'patients', name: 'Patients', icon: UserGroupIcon },
    { id: 'doctors', name: 'Doctors', icon: UserIcon },
    { id: 'appointments', name: 'Appointments', icon: CalendarIcon },
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">HMS</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors ${
              currentView === item.id ? 'bg-blue-50 text-primary border-r-4 border-primary' : ''
            }`}
          >
            <item.icon className="w-6 h-6 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar