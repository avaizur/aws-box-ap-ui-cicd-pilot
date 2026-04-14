import { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Card from '../../components/Card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Modal from '../../components/Modal/Modal';
import * as partsService from '../../services/parts.service';
import styles from './PartsPage.module.scss';
import tableStyles from '../../components/table/Table.module.scss';

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    brand: '',
    category: '',
    unitCost: '',
    unitPrice: '',
    isStocked: false,
    isActive: true,
  });

  useEffect(() => {
    loadParts();
  }, [filters]);

  const loadParts = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search || undefined,
        category: filters.category || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      };
      const response = await partsService.fetchParts(params);
      setParts(response || []);
    } catch (error) {
      console.error('Failed to load parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingPart(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      brand: '',
      category: '',
      unitCost: '',
      unitPrice: '',
      isStocked: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      sku: part.sku || '',
      name: part.name || '',
      description: part.description || '',
      brand: part.brand || '',
      category: part.category || '',
      unitCost: part.unitCost?.toString() || '',
      unitPrice: part.unitPrice?.toString() || '',
      isStocked: part.isStocked || false,
      isActive: part.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (part) => {
    if (window.confirm(`Are you sure you want to delete ${part.name}?`)) {
      try {
        await partsService.deletePart(part.id);
        loadParts();
      } catch (error) {
        alert('Failed to delete part');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitCost: parseFloat(formData.unitCost),
        unitPrice: parseFloat(formData.unitPrice),
      };
      if (editingPart) {
        await partsService.updatePart(editingPart.id, payload);
      } else {
        await partsService.createPart(payload);
      }
      setIsModalOpen(false);
      loadParts();
    } catch (error) {
      alert('Failed to save part');
    }
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(parts.map(p => p.category).filter(Boolean))];

  const tableDefinition = {
    columns: [
      { key: 'sku', label: 'SKU', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'brand', label: 'Brand', sortable: true },
      { key: 'categoryDescription', label: 'Category', sortable: true },
      { key: 'unitCost', label: 'Unit Cost', sortable: true, type: 'currency' },
      { key: 'unitPrice', label: 'Unit Price', sortable: true, type: 'currency' },
      { key: 'isActive', label: 'Is Active', sortable: true, type: 'boolean' },
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
    <PageLayout title="Parts">
      <Card>
        <div className={styles.filters}>
          <Input
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by name..."
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            options={[{ value: '', label: 'All' }, ...categories.map(c => ({ value: c, label: c }))]}
          />
          <Input
            label="Min Price"
            type="number"
            step="0.01"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <Input
            label="Max Price"
            type="number"
            step="0.01"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </Card>

      <Card>
        <div className={styles.tableHeader}>
          <h3>Parts</h3>
          <Button onClick={handleNew}>New</Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table tableDefinition={tableDefinition} data={parts} setData={setParts} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPart ? 'Edit Part' : 'New Part'}
      >
        <form onSubmit={handleSave} className={styles.form}>
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <Input
            label="Unit Cost"
            type="number"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            required
          />
          <Input
            label="Unit Price"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="isStocked"
              checked={formData.isStocked}
              onChange={(e) => setFormData({ ...formData, isStocked: e.target.checked })}
            />
            <label htmlFor="isStocked">Is Stocked</label>
          </div>
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



