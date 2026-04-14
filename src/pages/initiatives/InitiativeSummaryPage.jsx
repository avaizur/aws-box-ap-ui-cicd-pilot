import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import * as initiativeService from '../../services/initiative.service';
import styles from './InitiativeSummaryPage.module.scss';
import Table from '../../components/table/Table';
import tableStyles from '../../components/table/Table.module.scss';

function parseSummaryDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function matchesFilters(row, filters) {
  const text = (filters.searchText || '').trim().toLowerCase();
  if (text) {
    const parts = [
      row.description,
      row.submitterName,
      row.initiativeId != null ? String(row.initiativeId) : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!parts.includes(text)) return false;
  }

  const submitted = parseSummaryDate(row.dateSubmitted);
  if (filters.submittedFrom) {
    const from = new Date(`${filters.submittedFrom}T00:00:00`);
    if (!submitted || submitted < from) return false;
  }
  if (filters.submittedTo) {
    const to = new Date(`${filters.submittedTo}T23:59:59.999`);
    if (!submitted || submitted > to) return false;
  }
  return true;
}

export default function InitiativeSummaryPage() {
  const navigate = useNavigate();
  const [allSummaries, setAllSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchText: '',
    submittedFrom: '',
    submittedTo: '',
  });

  const loadSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await initiativeService.getAllInitiativeSummaries();
      setAllSummaries(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load initiative summaries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const filteredSummaries = useMemo(
    () => allSummaries.filter((row) => matchesFilters(row, filters)),
    [allSummaries, filters],
  );

  const handleNew = () => navigate('/initiatives/create');

  const handleEdit = (row) => {
    navigate(`/initiatives/${row.initiativeId}`);
  };

  const handleDelete = async (row) => {
    const label = row.description || `initiative ${row.initiativeId}`;
    if (window.confirm(`Are you sure you want to delete ${label}?`)) {
      try {
        await initiativeService.deleteInitiative(row.initiativeId);
        loadSummaries();
      } catch (error) {
        alert('Failed to delete initiative');
      }
    }
  };

  const tableDefinition = {
    columns: [
      { key: 'initiativeId', label: 'ID', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { key: 'submitterName', label: 'Submitter', sortable: true },
      { key: 'dateSubmitted', label: 'Date submitted', sortable: true, type: 'date' },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'totalPartners', label: 'Total partners', sortable: true },
    ],
    actions: [
      {
        render: (row) => (
          <button
            type="button"
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
            type="button"
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
    <PageLayout title="Initiatives">
      <Card className={styles.filterCard}>
        <div className={styles.filters}>
          <Input
            label="Search"
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            placeholder="Search by description, submitter, or ID..."
          />
          <Input
            label="Submitted From"
            type="date"
            value={filters.submittedFrom}
            onChange={(e) => setFilters({ ...filters, submittedFrom: e.target.value })}
          />
          <Input
            label="Submitted To"
            type="date"
            value={filters.submittedTo}
            onChange={(e) => setFilters({ ...filters, submittedTo: e.target.value })}
          />
        </div>
      </Card>

      <Card className={styles.tableCard} noPadding>
        <div className={styles.tableHeader}>
          <h3>Initiatives</h3>
          <Button onClick={handleNew}>New</Button>
        </div>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <Table
            tableDefinition={tableDefinition}
            data={filteredSummaries}
            setData={() => {}}
          />
        )}
      </Card>
    </PageLayout>
  );
}
