import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/layout/PageLayout/PageLayout';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import Textarea from '../../../components/Textarea/Textarea';
import * as initiativeService from '../../../services/initiative.service';
import styles from './CreateInitiativePage.module.scss';

export default function CreateInitiativePage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setSaving(true);
    try {
      const created = await initiativeService.createInitiative({
        description: description.trim(),
      });

      const initiativeId = created?.initiativeId ?? created?.id;
      if (!initiativeId) {
        alert('Initiative created but initiativeId was not returned');
        return;
      }

      navigate(`/initiatives/${initiativeId}`);
    } catch (e2) {
      console.error(e2);
      setError('Failed to create initiative');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="">
      <Card title="Create Initiative">
        <form onSubmit={handleCreate} className={styles.form}>
          <Textarea
            label="Description"
            value={description}
            required
            error={error}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => navigate('/initiatives')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}

