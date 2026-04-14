import { useMemo, useState } from 'react';
import Button from '../../../../components/Button/Button';
import Modal from '../../../../components/Modal/Modal';
import Table from '../../../../components/table/Table';
import tableStyles from '../../../../components/table/Table.module.scss';
import Input from '../../../../components/Input/Input';
import styles from '../EditInitiativePage.module.scss';

function buildEmptyPartner() {
  return {
    id: '',
    initiativeHeaderId: '',
    partnerName: '',
    sfdcLink: '',
    apnSfdcLink: '',
    partnerTier: '',
    partnerSince: '',
    businessPlanOwners: '',
    apnPrograms: '',
    officeLocations: '',
    keyFocusVerticals: '',
    competencies: '',
  };
}

export default function PartnershipOverviewTab({ partners, setPartners }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [partnerForm, setPartnerForm] = useState(buildEmptyPartner());

  const tableData = useMemo(() => {
    return (partners || []).map((p, i) => ({ ...p, _rowIndex: i }));
  }, [partners]);

  const tableDefinition = useMemo(() => {
    return {
      columns: [
        { key: 'partnerName', label: 'Partner name', sortable: true },
        { key: 'partnerTier', label: 'Partner tier', sortable: true, type: 'date' },
        { key: 'partnerSince', label: 'Partner since', sortable: true, type: 'date' },
      ],
      actions: [
        {
          render: (row) => (
            <button
              type="button"
              className={`${tableStyles.actionButton} ${tableStyles.edit}`}
              onClick={() => openEdit(row._rowIndex)}
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
              onClick={() => openDelete(row._rowIndex)}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  const openNew = () => {
    setEditingIndex(null);
    setPartnerForm(buildEmptyPartner());
    setIsModalOpen(true);
  };

  function openEdit(index) {
    const row = partners?.[index];
    if (!row) return;
    setEditingIndex(index);
    setPartnerForm({ ...buildEmptyPartner(), ...row });
    setIsModalOpen(true);
  }

  function openDelete(index) {
    if (!window.confirm('Remove this partner row?')) return;
    setPartners((prev) => (prev || []).filter((_, i) => i !== index));
  }

  const savePartner = (e) => {
    e.preventDefault();
    const nextPartner = { ...partnerForm };

    setPartners((prev) => {
      const list = [...(prev || [])];
      if (editingIndex === null) {
        list.push(nextPartner);
      } else {
        list[editingIndex] = nextPartner;
      }
      return list;
    });
    setIsModalOpen(false);
  };

  return (
    <div className={styles.form}>
      <div className={styles.partnersHeader}>
        <h3 className={styles.partnersTitle}>Partners</h3>
        <Button type="button" onClick={openNew}>
          New<span className={styles.newButtonCaret}>▾</span>
        </Button>
      </div>

      <Table tableDefinition={tableDefinition} data={tableData} setData={() => {}} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex === null ? 'New partner' : 'Edit partner'}
        footer={
          <div className={styles.modalFooter}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" form="partner-form">
              Save
            </Button>
          </div>
        }
      >
        <form id="partner-form" onSubmit={savePartner} className={styles.form}>
          <Input
            label="Partner ID"
            type="number"
            value={partnerForm.id ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, id: e.target.value }))}
          />
          <Input
            label="Initiative Header ID"
            type="number"
            value={partnerForm.initiativeHeaderId ?? ''}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, initiativeHeaderId: e.target.value }))
            }
          />
          <Input
            label="Partner Name"
            value={partnerForm.partnerName ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, partnerName: e.target.value }))}
          />
          <Input
            label="SFDC Link"
            value={partnerForm.sfdcLink ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, sfdcLink: e.target.value }))}
          />
          <Input
            label="APN SFDC Link"
            value={partnerForm.apnSfdcLink ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, apnSfdcLink: e.target.value }))}
          />
          <Input
            label="Partner Tier"
            type="date"
            value={partnerForm.partnerTier ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, partnerTier: e.target.value }))}
          />
          <Input
            label="Partner Since"
            type="date"
            value={partnerForm.partnerSince ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, partnerSince: e.target.value }))}
          />
          <Input
            label="Business Plan Owners"
            value={partnerForm.businessPlanOwners ?? ''}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, businessPlanOwners: e.target.value }))
            }
          />
          <Input
            label="APN Programs"
            value={partnerForm.apnPrograms ?? ''}
            onChange={(e) => setPartnerForm((p) => ({ ...p, apnPrograms: e.target.value }))}
          />
          <Input
            label="Office Locations"
            value={partnerForm.officeLocations ?? ''}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, officeLocations: e.target.value }))
            }
          />
          <Input
            label="Key Focus Verticals"
            value={partnerForm.keyFocusVerticals ?? ''}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, keyFocusVerticals: e.target.value }))
            }
          />
          <Input
            label="Competencies"
            value={partnerForm.competencies ?? ''}
            onChange={(e) =>
              setPartnerForm((p) => ({ ...p, competencies: e.target.value }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}

