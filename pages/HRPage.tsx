
import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';
import { Employee } from '../types';

const HRPage: React.FC = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const openAddModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    // Fix: Changed id type from number to string to match data model.
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            deleteEmployee(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    }
    
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const EmployeeForm: React.FC<{employee: Employee | null, onSave: (emp: any) => void, onCancel: () => void}> = ({ employee, onSave, onCancel }) => {
        const [name, setName] = useState(employee?.name || '');
        const [role, setRole] = useState(employee?.role || '');
        const [department, setDepartment] = useState(employee?.department || '');
        const [status, setStatus] = useState<Employee['status']>(employee?.status || 'Active');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Fix: Changed id to _id to match the data model.
            const employeeData = { _id: employee?._id, name, role, department, status };
            onSave(employeeData);
        };
        
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
        
        return (
             <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required/>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <input type="text" value={role} onChange={e => setRole(e.target.value)} className={inputClasses} required/>
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={inputClasses} required/>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Employee['status'])} className={inputClasses}>
                            <option>Active</option>
                            <option>On Leave</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Save Employee
                    </button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">HR Management</h1>
                <div className="flex items-center gap-4">
                     <input 
                        type="text"
                        placeholder="Search by employee name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                    <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300 whitespace-nowrap">
                        Add Employee
                    </button>
                </div>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Department</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
                                // Fix: Changed employee.id to employee._id to match the data model.
                                <tr key={employee._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{employee.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.role}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.department}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => openEditModal(employee)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400">Edit</button>
                                        {/* Fix: Changed employee.id to employee._id to match the data model. */}
                                        <button onClick={() => handleDelete(employee._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                 <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No employees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEmployee ? "Edit Employee" : "Add New Employee"}>
                <EmployeeForm 
                    employee={editingEmployee}
                    onCancel={closeModal}
                    onSave={(employeeData) => {
                        if(editingEmployee) {
                            updateEmployee(employeeData);
                        } else {
                            addEmployee(employeeData);
                        }
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};
export default HRPage;