import { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Modal from '../../components/Modal/Modal';
import TableActionMenu from '../../components/table/TableActionMenu';
import * as usersService from '../../services/users.service';
import { toISOString } from '../../utils/dateUtils';
import styles from './UsersPage.module.scss';
import tableStyles from '../../components/table/Table.module.scss';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    lastLoginFrom: '',
    lastLoginTo: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'USER',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search || undefined,
        lastLoginFrom: filters.lastLoginFrom ? toISOString(filters.lastLoginFrom + 'T00:00:00') : undefined,
        lastLoginTo: filters.lastLoginTo ? toISOString(filters.lastLoginTo + 'T23:59:59') : undefined,
        page: 0,
        pageSize: 1000,
      };
      const response = await usersService.fetchUsers(params);
      setUsers(response.items || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      displayName: '',
      role: 'USER',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      displayName: user.displayName || '',
      role: user.role || 'USER',
      isActive: user.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.displayName}?`)) {
      try {
        await usersService.deleteUser(user.id);
        loadUsers();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersService.updateUser(editingUser.id, formData);
      } else {
        await usersService.createUser(formData);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      alert('Failed to save user');
    }
  };

  const roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'STAFF', label: 'Staff' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const handleExportToCSV = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row to export');
      return;
    }

    // Get column headers
    const headers = ['Display Name', 'Role', 'Last Login At'];
    
    // Convert selected rows to CSV format
    const csvRows = [
      headers.join(','),
      ...selectedRows.map((row) => {
        const displayName = (row.displayName || '').replace(/"/g, '""');
        const role = (row.role || '').replace(/"/g, '""');
        const lastLoginAt = row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : '';
        return `"${displayName}","${role}","${lastLoginAt}"`;
      }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (user) => {
    const userText = `${user.displayName} (${user.email})`;
    navigator.clipboard.writeText(userText).then(() => {
      alert(`Copied: ${userText}`);
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const handleApprove = (user) => {
    if (window.confirm(`Are you sure you want to approve ${user.displayName}?`)) {
      // TODO: Implement approve functionality
      alert(`Approved ${user.displayName}`);
    }
  };

  const tableDefinition = {
    columns: [
      { key: 'displayName', label: 'Display Name', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'lastLoginAt', label: 'Last Login At', sortable: true, type: 'date' },
    ],
    actions: [
      {
        render: (row) => (
          <button
            className={`${tableStyles.actionButton} ${tableStyles.edit}`}
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <i className="bi bi-pencil-fill" aria-hidden="true" />
          </button>
        ),
      },
      {
        render: (row) => (
          <button
            className={`${tableStyles.actionButton} ${tableStyles.delete}`}
            onClick={() => handleDelete(row)}
            title="Delete"
          >
            <i className="bi bi-trash-fill" aria-hidden="true" />
          </button>
        ),
      },
      {
        render: (row) => (
          <TableActionMenu
            row={row}
            items={[
              {
                render: () => <span>Copy</span>,
                onClick: handleCopy,
                visible: true,
                enabled: true,
              },
              {
                render: () => <span>Approve</span>,
                onClick: handleApprove,
                visible: true,
                enabled: true,
              },
              // {
              //   render: () => <span>Delete</span>,
              //   onClick: handleApprove,
              //   visible: true,
              //   enabled: true,
              // },
            ]}
          />
        ),
      },
    ],
    selectable: true,
    pagination: true,
    pageSize: 25,
  };

  return (
    <PageLayout title="Users">
      <Card>
        <div className={styles.filters}>
          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by display name..."
          />
          <Input
            label="Last Login From"
            type="date"
            value={filters.lastLoginFrom}
            onChange={(e) => setFilters({ ...filters, lastLoginFrom: e.target.value })}
          />
          <Input
            label="Last Login To"
            type="date"
            value={filters.lastLoginTo}
            onChange={(e) => setFilters({ ...filters, lastLoginTo: e.target.value })}
          />
        </div>
      </Card>

      <Card>
        <div className={styles.tableHeader}>
          <h3>Users</h3>
          <div className={styles.toolbarButtons}>
            <Button onClick={handleExportToCSV} variant="outline">
              Export To CSV
            </Button>
            <Button onClick={handleNew}>New</Button>
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table 
            tableDefinition={tableDefinition} 
            data={users} 
            setData={setUsers}
            onSelectedRowsChange={setSelectedRows}
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'New User'}
      >
        <form onSubmit={handleSave} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={roleOptions}
            required
          />
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Is Active</label>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}



