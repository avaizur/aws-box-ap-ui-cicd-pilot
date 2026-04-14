import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Tabs from '../../components/Tabs/Tabs';
import Button from '../../components/Button/Button';
import * as jobsService from '../../services/jobs.service';
import { formatDateTime, formatDateForInput } from '../../utils/dateUtils';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Table from '../../components/table/Table';
import ImageManager from '../../components/ImageManager/ImageManager';
import styles from './ViewJobPage.module.scss';
import tableStyles from '../../components/table/Table.module.scss';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
];

function buildFormState(job) {
  return {
    jobNumber: job?.jobNumber || '',
    customerId: job?.customerId?.toString?.() || '',
    bikeId: job?.bikeId?.toString?.() || '',
    status: job?.status || 'NEW',
    priority: job?.priority || 'NORMAL',
    reportedProblem: job?.reportedProblem || '',
    initialAssessment: job?.initialAssessment || '',
    estimatedCost: job?.estimatedCost?.toString?.() || '',
    approvedCostLimit: job?.approvedCostLimit === null || job?.approvedCostLimit === undefined ? '' : job.approvedCostLimit.toString(),
    assignedToUserId: job?.assignedToUserId === null || job?.assignedToUserId === undefined ? '' : job.assignedToUserId.toString(),
    dueDate: job?.dueDate ? formatDateForInput(job.dueDate) : '',
  };
}

function validateDetails(formData) {
  const errors = {};
  if (!formData.customerId) errors.customerId = 'Customer is required';
  if (!formData.bikeId) errors.bikeId = 'Bike is required';
  if (!formData.status) errors.status = 'Status is required';
  if (!formData.priority) errors.priority = 'Priority is required';
  if (!formData.reportedProblem?.trim?.()) errors.reportedProblem = 'Reported problem is required';
  if (formData.estimatedCost === '' || Number.isNaN(Number(formData.estimatedCost))) {
    errors.estimatedCost = 'Estimated cost is required';
  }
  return errors;
}

export default function ViewJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState(buildFormState(null));
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await jobsService.fetchJob(id);
        setJob(response);
        setFormData(buildFormState(response));
        setFormErrors({});
      } catch (e) {
        setLoadError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const customerName = job?.customer?.fullName || '';

  const handleDetailsChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();

    const errors = validateDetails(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        jobNumber: formData.jobNumber || null,
        customerId: parseInt(formData.customerId, 10),
        bikeId: parseInt(formData.bikeId, 10),
        status: formData.status,
        priority: formData.priority,
        reportedProblem: formData.reportedProblem,
        initialAssessment: formData.initialAssessment || null,
        estimatedCost: parseFloat(formData.estimatedCost),
        approvedCostLimit: formData.approvedCostLimit ? parseFloat(formData.approvedCostLimit) : null,
        assignedToUserId: formData.assignedToUserId ? parseInt(formData.assignedToUserId, 10) : null,
        dueDate: formData.dueDate || null,
      };

      const updated = await jobsService.updateJob(id, payload);
      setJob(updated);
      setFormData(buildFormState(updated));
      setFormErrors({});
    } catch (e2) {
      alert('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleNotImplemented = (label) => {
    alert(`${label} is not implemented yet`);
  };

  const notesData = job?.jobNotes || [];
  const partsData = job?.jobParts || [];
  const statusHistoryData = job?.jobStatusHistory || [];

  const tabItems = useMemo(() => {
    return [
      {
        value: 'details',
        label: 'Details',
        content: (
          <form onSubmit={handleSaveDetails} className={styles.form}>
            <Input label="Customer" value={customerName} disabled />

            <Input
              label="Job Number"
              value={formData.jobNumber}
              onChange={(e) => handleDetailsChange('jobNumber', e.target.value)}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleDetailsChange('status', e.target.value)}
              options={STATUS_OPTIONS}
              required
              error={formErrors.status}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleDetailsChange('priority', e.target.value)}
              options={PRIORITY_OPTIONS}
              required
              error={formErrors.priority}
            />

            <Textarea
              label="Reported Problem"
              value={formData.reportedProblem}
              onChange={(e) => handleDetailsChange('reportedProblem', e.target.value)}
              required
              error={formErrors.reportedProblem}
            />

            <Textarea
              label="Initial Assessment"
              value={formData.initialAssessment}
              onChange={(e) => handleDetailsChange('initialAssessment', e.target.value)}
            />

            <Input
              label="Estimated Cost"
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => handleDetailsChange('estimatedCost', e.target.value)}
              required
              error={formErrors.estimatedCost}
            />

            <Input
              label="Approved Cost Limit"
              type="number"
              step="0.01"
              value={formData.approvedCostLimit}
              onChange={(e) => handleDetailsChange('approvedCostLimit', e.target.value)}
            />

            <Input
              label="Assigned To User ID"
              type="number"
              value={formData.assignedToUserId}
              onChange={(e) => handleDetailsChange('assignedToUserId', e.target.value)}
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleDetailsChange('dueDate', e.target.value)}
            />

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => navigate('/jobs')}>
                Back
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        ),
      },
      {
        value: 'bike',
        label: 'Bike',
        content: (
          <>
            {!job?.bike ? (
              <div>No bike data</div>
            ) : (
              <>
                <div className={styles.kvGrid}>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Label</div>
                    <div className={styles.kvValue}>{job.bike.label}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Manufacturer</div>
                    <div className={styles.kvValue}>{job.bike.manufacturer}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Model</div>
                    <div className={styles.kvValue}>{job.bike.model}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Type</div>
                    <div className={styles.kvValue}>{job.bike.type}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Frame Serial</div>
                    <div className={styles.kvValue}>{job.bike.frameSerial || '-'}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Wheel Size</div>
                    <div className={styles.kvValue}>{job.bike.wheelSize || '-'}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Colour</div>
                    <div className={styles.kvValue}>{job.bike.colour || '-'}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Electric</div>
                    <div className={styles.kvValue}>{job.bike.hasElectric ? 'Yes' : 'No'}</div>
                  </div>
                  <div className={styles.kvRow}>
                    <div className={styles.kvKey}>Notes</div>
                    <div className={styles.kvValue}>{job.bike.notes || '-'}</div>
                  </div>
                </div>
                <ImageManager
                  entityType="bikes"
                  entityId={job.bike.id}
                  images={job.bike.imageGroup?.images || []}
                  onImagesChange={(updatedImages) => {
                    setJob((prev) => ({
                      ...prev,
                      bike: {
                        ...prev.bike,
                        imageGroup: {
                          ...prev.bike.imageGroup,
                          images: updatedImages,
                        },
                      },
                    }));
                  }}
                />
              </>
            )}
          </>
        ),
      },
      {
        value: 'notes',
        label: 'Notes',
        content: (
          <Table
            tableDefinition={{
              columns: [
                { key: 'noteTypeDescription', label: 'Note Type', sortable: true },
                {
                  key: 'createdByUserDisplayName',
                  label: 'Created By',
                  sortable: false,
                  render: (row) => row.createdByUserDisplayName || row.createdByUser?.displayName || row.createdByUser?.email || row.createdByUserId || '-',
                },
                {
                  key: 'createdAt',
                  label: 'Created At',
                  sortable: true,
                  render: (row) => formatDateTime(row.createdAt),
                },
                {
                  key: 'message',
                  label: 'Message',
                  sortable: false,
                  render: (row) => (
                    <span className={styles.truncate} title={row.message || ''}>
                      {row.message}
                    </span>
                  ),
                },
              ],
              actions: [
                {
                  render: (row) => (
                    <button
                      className={`${tableStyles.actionButton} ${tableStyles.edit}`}
                      onClick={() => handleNotImplemented('Edit note')}
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
                      onClick={() => handleNotImplemented('Delete note')}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill" aria-hidden="true" />
                    </button>
                  ),
                },
              ],
              pagination: true,
              pageSize: 25,
            }}
            data={notesData}
            setData={() => {}}
          />
        ),
      },
      {
        value: 'parts',
        label: 'Parts',
        content: (
          <Table
            tableDefinition={{
              columns: [
                { key: 'partId', label: 'Part ID', sortable: true },
                { key: 'quantity', label: 'Quantity', sortable: true },
                { key: 'unitPriceAtTime', label: 'Unit Price At Time', sortable: true, type: 'currency' },
              ],
              actions: [
                {
                  render: (row) => (
                    <button
                      className={`${tableStyles.actionButton} ${tableStyles.edit}`}
                      onClick={() => handleNotImplemented('Edit part')}
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
                      onClick={() => handleNotImplemented('Delete part')}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill" aria-hidden="true" />
                    </button>
                  ),
                },
              ],
              pagination: true,
              pageSize: 25,
            }}
            data={partsData}
            setData={() => {}}
          />
        ),
      },
      {
        value: 'statusHistory',
        label: 'Status History',
        content: (
          <Table
            tableDefinition={{
              columns: [
                { key: 'fromStatus', label: 'From Status', sortable: true },
                { key: 'toStatus', label: 'To Status', sortable: true },
                {
                  key: 'changedByUser',
                  label: 'Changed By',
                  sortable: false,
                  render: (row) => row.changedByUser?.displayName || row.changedByUser?.email || row.changedByUserId || '-',
                },
                {
                  key: 'changedAt',
                  label: 'Changed At',
                  sortable: true,
                  render: (row) => formatDateTime(row.changedAt),
                },
              ],
              actions: [
                {
                  render: (row) => (
                    <button
                      className={`${tableStyles.actionButton} ${tableStyles.edit}`}
                      onClick={() => handleNotImplemented('Edit status history')}
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
                      onClick={() => handleNotImplemented('Delete status history')}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill" aria-hidden="true" />
                    </button>
                  ),
                },
              ],
              pagination: true,
              pageSize: 25,
            }}
            data={statusHistoryData}
            setData={() => {}}
          />
        ),
      },
    ];
  }, [
    customerName,
    formData,
    formErrors,
    job,
    navigate,
    notesData,
    partsData,
    saving,
    statusHistoryData,
  ]);

  const title = job?.jobNumber ? `Job ${job.jobNumber}` : 'View Job';

  return (
    <PageLayout title={title}>
      <Card title="View Job">
        {loading ? (
          <div>Loading...</div>
        ) : loadError ? (
          <div className={styles.errorRow}>
            <div>{loadError}</div>
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              Back
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onChange={setActiveTab} items={tabItems} />
        )}
      </Card>
    </PageLayout>
  );
}


