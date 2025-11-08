import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAppContext } from '../state/AppContext';
import { Employee } from '../types';

const HRPage: React.FC = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee, addNotification, getAuthHeaders, API_BASE_URL } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'dateJoined' | 'role'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(false);

    const departments = useMemo(() => {
        const depts = new Set(employees.map(emp => emp.department));
        return Array.from(depts).sort();
    }, [employees]);

    const openAddModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const openDeleteDialog = (id: string) => {
        setSelectedEmployeeId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (selectedEmployeeId) {
            await deleteEmployee(selectedEmployeeId);
            setIsDeleteDialogOpen(false);
            setSelectedEmployeeId(null);
        }
    };

    const handleAddPerformanceReview = async (employeeId: string, reviewer: string, comment: string, rating: number) => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/reviews`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reviewer, comment, rating })
            });
            if (!response.ok) throw new Error('Failed to add review');
            addNotification('Performance review added successfully', 'success');
            setIsPerformanceModalOpen(false);
            // Refresh employees
            window.location.reload();
        } catch (error: any) {
            addNotification(error.message || 'Failed to add review', 'error');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const filteredAndSortedEmployees = useMemo(() => {
        let filtered = employees.filter(emp => {
            if (emp.deletedAt) return false;
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
            const matchesRole = !filterRole || emp.role === filterRole;
            const matchesStatus = !filterStatus || emp.status === filterStatus;
            return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
        });

        filtered.sort((a, b) => {
            let aVal: any, bVal: any;
            if (sortBy === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else if (sortBy === 'dateJoined') {
                aVal = new Date(a.dateJoined || a.createdAt || 0).getTime();
                bVal = new Date(b.dateJoined || b.createdAt || 0).getTime();
            } else {
                aVal = a.role;
                bVal = b.role;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        return filtered;
    }, [employees, searchTerm, filterDepartment, filterRole, filterStatus, sortBy, sortOrder]);

    const EmployeeForm: React.FC<{ employee: Employee | null, onSave: (emp: any) => void, onCancel: () => void }> = ({ employee, onSave, onCancel }) => {
        const [name, setName] = useState(employee?.name || '');
        const [role, setRole] = useState<Employee['role']>(employee?.role || 'Staff');
        const [department, setDepartment] = useState(employee?.department || '');
        const [salary, setSalary] = useState(employee?.salary || 0);
        const [email, setEmail] = useState(employee?.contactInfo?.email || '');
        const [phone, setPhone] = useState(employee?.contactInfo?.phone || '');
        const [address, setAddress] = useState(employee?.contactInfo?.address || '');
        const [status, setStatus] = useState<Employee['status']>(employee?.status || 'Active');
        const [dateJoined, setDateJoined] = useState(employee?.dateJoined ? new Date(employee.dateJoined).toISOString().split('T')[0] : '');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const employeeData = {
                _id: employee?._id,
                name,
                role,
                department,
                salary: parseFloat(salary.toString()) || 0,
                contactInfo: { email, phone, address },
                status,
                dateJoined: dateJoined ? new Date(dateJoined) : new Date()
            };
            onSave(employeeData);
        };

        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";

        return (
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role *</label>
                            <select value={role} onChange={e => setRole(e.target.value as Employee['role'])} className={inputClasses} required>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department *</label>
                            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary</label>
                            <input type="number" value={salary} onChange={e => setSalary(parseFloat(e.target.value) || 0)} className={inputClasses} min="0" step="0.01" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Joined</label>
                            <input type="date" value={dateJoined} onChange={e => setDateJoined(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                        <textarea value={address} onChange={e => setAddress(e.target.value)} className={inputClasses} rows={2} />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Employee['status'])} className={inputClasses}>
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
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

    const PerformanceReviewForm: React.FC<{ employeeId: string, onCancel: () => void }> = ({ employeeId, onCancel }) => {
        const [reviewer, setReviewer] = useState('');
        const [comment, setComment] = useState('');
        const [rating, setRating] = useState(3);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleAddPerformanceReview(employeeId, reviewer, comment, rating);
        };

        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";

        return (
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reviewer Name *</label>
                        <input type="text" value={reviewer} onChange={e => setReviewer(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating *</label>
                        <select value={rating} onChange={e => setRating(parseInt(e.target.value))} className={inputClasses} required>
                            <option value={1}>1 - Poor</option>
                            <option value={2}>2 - Fair</option>
                            <option value={3}>3 - Good</option>
                            <option value={4}>4 - Very Good</option>
                            <option value={5}>5 - Excellent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment *</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} className={inputClasses} rows={4} required />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Review'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">HR Management</h1>
                <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300 whitespace-nowrap">
                    + Add Employee
                </button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                        <select
                            value={filterDepartment}
                            onChange={e => setFilterDepartment(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as any)}
                                className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            >
                                <option value="name">Name</option>
                                <option value="dateJoined">Date Joined</option>
                                <option value="role">Role</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer" onClick={() => setSortBy('name')}>Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Department</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Salary</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Performance</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map((employee) => (
                                <tr key={employee._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{employee.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                            employee.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                                            employee.role === 'Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {employee.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.department}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <div className="text-sm">
                                            {employee.contactInfo?.email && <div>{employee.contactInfo.email}</div>}
                                            {employee.contactInfo?.phone && <div className="text-gray-500">{employee.contactInfo.phone}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {employee.performanceMetrics?.rating ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-sm font-medium">{employee.performanceMetrics.rating.toFixed(1)}</span>
                                                <span className="text-xs text-gray-500">({employee.performanceMetrics.reviews?.length || 0})</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No ratings</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                            employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => openEditModal(employee)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400 text-sm">Edit</button>
                                            <button onClick={() => {
                                                setSelectedEmployeeId(employee._id);
                                                setIsPerformanceModalOpen(true);
                                            }} className="text-green-600 hover:underline font-semibold dark:text-green-400 text-sm">Review</button>
                                            <button onClick={() => openDeleteDialog(employee._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400 text-sm">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">No employees found.</td>
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
                        if (editingEmployee) {
                            updateEmployee(employeeData);
                        } else {
                            addEmployee(employeeData);
                        }
                        closeModal();
                    }}
                />
            </Modal>

            <Modal isOpen={isPerformanceModalOpen} onClose={() => setIsPerformanceModalOpen(false)} title="Add Performance Review">
                {selectedEmployeeId && <PerformanceReviewForm employeeId={selectedEmployeeId} onCancel={() => setIsPerformanceModalOpen(false)} />}
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action will soft-delete the employee (data will be kept for records)."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedEmployeeId(null);
                }}
                variant="danger"
            />
        </div>
    );
};

export default HRPage;
