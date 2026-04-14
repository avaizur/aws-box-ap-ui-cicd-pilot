import { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Modal from '../../components/Modal/Modal';
import Textarea from '../../components/Textarea/Textarea';
import * as customersService from '../../services/customers.service';
import { toISOString } from '../../utils/dateUtils';
import styles from './CustomersPage.module.scss';
import Table from '../../components/table/Table';
import tableStyles from '../../components/table/Table.module.scss';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    createdFrom: '',
    createdTo: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search || undefined,
        createdFrom: filters.createdFrom ? toISOString(filters.createdFrom + 'T00:00:00') : undefined,
        createdTo: filters.createdTo ? toISOString(filters.createdTo + 'T23:59:59') : undefined,
        page: 0,
        pageSize: 1000, // Load all for table pagination
      };
      const response = await customersService.fetchCustomers(params);
      setCustomers(response.items || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      addressLine1: customer.addressLine1 || '',
      addressLine2: customer.addressLine2 || '',
      city: customer.city || '',
      postcode: customer.postcode || '',
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.fullName}?`)) {
      try {
        await customersService.deleteCustomer(customer.id);
        loadCustomers();
      } catch (error) {
        alert('Failed to delete customer');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersService.updateCustomer(editingCustomer.id, formData);
      } else {
        await customersService.createCustomer(formData);
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error) {
      alert('Failed to save customer');
    }
  };

  const tableDefinition = {
    columns: [
      { key: 'fullName', label: 'Full Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true, type: 'secondary' },
      { key: 'phone', label: 'Phone', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'createdAt', label: 'Created At', sortable: true, type: 'date' },
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
    ],
    pagination: true,
    pageSize: 25,
  };

  return (
    <PageLayout title="Customers">
      <Card className={styles.filterCard}>
        <div className={styles.filters}>
          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, or phone..."
          />
          <Input
            label="Created From"
            type="date"
            value={filters.createdFrom}
            onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
          />
          <Input
            label="Created To"
            type="date"
            value={filters.createdTo}
            onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
          />
        </div>
      </Card>

      <Card className={styles.tableCard} noPadding>
        <div className={styles.tableHeader}>
          <h3>Customers</h3>
          <Button onClick={handleNew}>New</Button>
        </div>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <Table tableDefinition={tableDefinition} data={customers} setData={setCustomers} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        footer={
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              form="customer-form"
            >
              Save
            </Button>
          </div>
        }
      >
        <form id="customer-form" onSubmit={handleSave} className={styles.form}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Address Line 1"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          />
          <Input
            label="Address Line 2"
            value={formData.addressLine2}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          />
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <Input
            label="Postcode"
            value={formData.postcode}
            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>
    </PageLayout>
  );
}

