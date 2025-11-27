import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState({
    employee: '',
    shiftType: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    department: 'front-desk',
  });

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/admin/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(data.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(data.data.filter((e: any) => e.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.employee) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        'http://localhost:5000/api/admin/schedules',
        {
          ...formData,
          date: selectedDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchSchedules();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedules Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + Assign Schedule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {schedule.employee?.firstName} {schedule.employee?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(schedule.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{schedule.shiftType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {schedule.startTime} - {schedule.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{schedule.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Assign Schedule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee *</label>
                <select
                  required
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shift Type *</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="front-desk">Front Desk</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="security">Security</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="spa">Spa</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                >
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
