import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    appointmentsByStatus: [],
    last7DaysAppointments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats/detailed`);
        setStats(response.data);
      } catch (error) {
        setError(error.message);
        toast.error('Error fetching dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const lineChartData = {
    labels: stats.last7DaysAppointments.map(item => item._id),
    datasets: [
      {
        label: 'Appointments',
        data: stats.last7DaysAppointments.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const pieChartData = {
    labels: stats.appointmentsByStatus.map(item => item._id),
    datasets: [
      {
        data: stats.appointmentsByStatus.map(item => item.count),
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)'
        ]
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
  };

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );

  const hasAppointmentData = stats.last7DaysAppointments?.length > 0;
  const hasStatusData = stats.appointmentsByStatus?.length > 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.totalDoctors}
          color="bg-green-500"
        />
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments}
          color="bg-purple-500"
        />
        <StatCard 
          title="Today's Appointments" 
          value={stats.todayAppointments}
          color="bg-yellow-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Last 7 Days Appointments</h3>
          {hasAppointmentData ? (
            <Line data={lineChartData} options={chartOptions} />
          ) : (
            <EmptyState message="No appointment data available for the last 7 days" />
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Appointments by Status</h3>
          <div className="w-3/4 mx-auto">
            {hasStatusData ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <EmptyState message="No status data available" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color.replace('bg-', 'text-')}`}>
        {value}
      </p>
    </div>
  )
}