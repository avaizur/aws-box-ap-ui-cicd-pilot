import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Modal from '../../components/Modal/Modal';
import * as jobsService from '../../services/jobs.service';
import * as customersService from '../../services/customers.service';
import styles from './JobsPage.module.scss';
import tableStyles from '../../components/table/Table.module.scss';

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobNumber: '',
    customerId: '',
    bikeId: '',
    status: 'NEW',
    priority: 'NORMAL',
    reportedProblem: '',
    initialAssessment: '',
    estimatedCost: '',
    approvedCostLimit: '',
    assignedToUserId: '',
    dueDate: '',
  });

  useEffect(() => {
    loadJobs();
    loadCustomers();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsService.fetchJobs({ pageSize: 1000 });
      setJobs(response.items || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customersService.fetchCustomers({ pageSize: 1000 });
      setCustomers(response.items || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleNew = () => {
    setFormData({
      jobNumber: '',
      customerId: '',
      bikeId: '',
      status: 'NEW',
      priority: 'NORMAL',
      reportedProblem: '',
      initialAssessment: '',
      estimatedCost: '',
      approvedCostLimit: '',
      assignedToUserId: '',
      dueDate: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleDelete = async (job) => {
    if (window.confirm(`Are you sure you want to delete job ${job.jobNumber}?`)) {
      try {
        await jobsService.deleteJob(job.id);
        loadJobs();
      } catch (error) {
        alert('Failed to delete job');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        bikeId: parseInt(formData.bikeId),
        estimatedCost: parseFloat(formData.estimatedCost),
        approvedCostLimit: formData.approvedCostLimit ? parseFloat(formData.approvedCostLimit) : null,
        assignedToUserId: formData.assignedToUserId ? parseInt(formData.assignedToUserId) : null,
      };
      await jobsService.createJob(payload);
      setIsModalOpen(false);
      loadJobs();
    } catch (error) {
      alert('Failed to save job');
    }
  };

  const statusOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
  ];

  const tableDefinition = {
    columns: [
      { key: 'jobNumber', label: 'Job Number', sortable: true },
      { 
        key: 'customer', 
        label: 'Customer', 
        sortable: true, 
        render: (row) => row.customer?.fullName || 'N/A' 
      },
      { key: 'statusDescription', label: 'Status', sortable: true },
      { key: 'priority', label: 'Priority', sortable: true },
      { key: 'assignedToUserId', label: 'Assigned To', sortable: true },
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
    <PageLayout title="Jobs">
      <Card>
        <div className={styles.tableHeader}>
          <h3>Jobs</h3>
          <Button onClick={handleNew}>New</Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table tableDefinition={tableDefinition} data={jobs} setData={setJobs} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Job"
      >
        <form onSubmit={handleSave} className={styles.form}>
          <Input
            label="Job Number"
            value={formData.jobNumber}
            onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
          />
          <Select
            label="Customer"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            options={customers.map(c => ({ value: c.id.toString(), label: c.fullName }))}
            placeholder="Select customer"
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={priorityOptions}
            required
          />
          <Textarea
            label="Reported Problem"
            value={formData.reportedProblem}
            onChange={(e) => setFormData({ ...formData, reportedProblem: e.target.value })}
            required
          />
          <Input
            label="Estimated Cost"
            type="number"
            step="0.01"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
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

