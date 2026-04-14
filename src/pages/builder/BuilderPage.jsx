import { useCallback, useEffect, useMemo, useState } from 'react';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import * as dataService from '../../services/data.service';
import styles from './BuilderPage.module.scss';
import {
  FIELD_TYPES,
  buildInitialTabs,
  createDefaultField,
  newId,
  normalizeSource,
  serializeBuilderTabsToJsonString,
} from './builderUtils';

function PreviewField({ field, isSelected, onSelect }) {
  const req = field.required ? <span className={styles.requiredMark}>*</span> : null;
  const disabled = field.readonly;
  const val = field.defaultValue ?? '';
  const rowClass = `${styles.previewRow} ${isSelected ? styles.previewRowActive : ''}`;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  if (field.type === 'checkbox') {
    const checked = val === true || val === 'true';
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={checked} disabled />
          {field.title} {req}
        </label>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <textarea value={String(val)} readOnly disabled={disabled} />
        </div>
      </div>
    );
  }

  if (field.type === 'datefield') {
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <input type="date" value={String(val)} readOnly disabled={disabled} />
        </div>
      </div>
    );
  }

  if (field.type === 'email') {
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <input type="email" value={String(val)} readOnly disabled={disabled} />
        </div>
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <input type="number" value={String(val)} readOnly disabled={disabled} />
        </div>
      </div>
    );
  }

  if (field.type === 'phone') {
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <input type="tel" value={String(val)} readOnly disabled={disabled} />
        </div>
      </div>
    );
  }

  if (field.type === 'dropdown') {
    const choices = Array.isArray(field.choices) ? field.choices : [];
    return (
      <div className={rowClass} onClick={handleClick} role="presentation">
        <div className={styles.previewForm}>
          <label>
            {field.title} {req}
          </label>
          <select value={String(field.defaultValue ?? '')} disabled={disabled}>
            {choices.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className={rowClass} onClick={handleClick} role="presentation">
      <div className={styles.previewForm}>
        <label>
          {field.title} {req}
        </label>
        <input type="text" value={String(val)} readOnly disabled={disabled} />
      </div>
    </div>
  );
}

function applyTabsState(setTabs, setSelectedTabId, setSelectedFieldId, nextTabs) {
  setTabs(nextTabs);
  setSelectedTabId(nextTabs[0]?.id ?? null);
  setSelectedFieldId(nextTabs[0]?.fields[0]?.id ?? null);
}

export default function BuilderPage() {
  const [tabs, setTabs] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    function useFallback() {
      const fallback = buildInitialTabs();
      applyTabsState(setTabs, setSelectedTabId, setSelectedFieldId, fallback);
    }

    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const ds = await dataService.getDataStoreByName('form');
        const raw = ds?.jsonData;
        if (typeof raw !== 'string' || raw.trim() === '') {
          if (!cancelled) useFallback();
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          if (!cancelled) {
            setLoadError('Stored form JSON was invalid; loaded default form.');
            useFallback();
          }
          return;
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
          if (!cancelled) useFallback();
          return;
        }
        const next = normalizeSource(parsed);
        if (!cancelled) {
          if (!next.length) {
            useFallback();
          } else {
            applyTabsState(setTabs, setSelectedTabId, setSelectedFieldId, next);
          }
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLoadError('Could not load form from server; showing default form.');
          useFallback();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTab = useMemo(
    () => tabs.find((t) => t.id === selectedTabId) || null,
    [tabs, selectedTabId],
  );

  const selectedField = useMemo(
    () => selectedTab?.fields.find((f) => f.id === selectedFieldId) || null,
    [selectedTab, selectedFieldId],
  );

  const patchField = useCallback((tabId, fieldId, patch) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        return {
          ...t,
          fields: t.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
        };
      }),
    );
  }, []);

  const handleSelectTab = (tab) => {
    setSelectedTabId(tab.id);
    setSelectedFieldId(tab.fields[0]?.id ?? null);
  };

  const handleRenameTab = (tab) => {
    const next = window.prompt('Rename tab', tab.name);
    if (next && next.trim()) {
      setTabs((prev) => prev.map((t) => (t.id === tab.id ? { ...t, name: next.trim() } : t)));
    }
  };

  const handleDeleteTab = (tab) => {
    if (tabs.length === 1) {
      window.alert('At least one tab is required.');
      return;
    }
    if (!window.confirm(`Delete "${tab.name}"?`)) return;
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tab.id);
      if (selectedTabId === tab.id) {
        const first = next[0];
        setSelectedTabId(first.id);
        setSelectedFieldId(first.fields[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleAddTab = () => {
    const newTabId = newId();
    const blank = { id: newTabId, name: `Tab ${tabs.length + 1}`, fields: [] };
    setTabs((prev) => [...prev, blank]);
    setSelectedTabId(newTabId);
    setSelectedFieldId(null);
  };

  const handleSave = async () => {
    const json = serializeBuilderTabsToJsonString(tabs);
    try {
      await dataService.updateDataStore('form', { jsonData: json });
      window.alert('Form saved.');
    } catch (e) {
      console.error(e);
      window.alert('Failed to save form.');
    }
  };

  const handleAddField = () => {
    if (!selectedTab) return;
    const idx = selectedTab.fields.length;
    const newField = createDefaultField(idx);
    setTabs((prev) =>
      prev.map((t) => (t.id === selectedTab.id ? { ...t, fields: [...t.fields, newField] } : t)),
    );
    setSelectedFieldId(newField.id);
  };

  const handleRemoveField = (fieldId) => {
    if (!selectedTab) return;
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTab.id) return t;
        const nextFields = t.fields.filter((f) => f.id !== fieldId);
        return { ...t, fields: nextFields };
      }),
    );
    if (selectedFieldId === fieldId) {
      const nextList = selectedTab.fields.filter((f) => f.id !== fieldId);
      setSelectedFieldId(nextList[0]?.id ?? null);
    }
  };

  const handleFieldTypeChange = (e) => {
    const nextType = e.target.value;
    if (!selectedTab || !selectedField) return;
    const patch = { type: nextType };
    if (nextType === 'dropdown' && (!selectedField.choices || selectedField.choices.length === 0)) {
      patch.choices = ['Choice 1', 'Choice 2'];
    }
    patchField(selectedTab.id, selectedField.id, patch);
  };

  const updateChoice = (index, value) => {
    if (!selectedTab || !selectedField) return;
    const choices = [...(selectedField.choices || [])];
    choices[index] = value;
    patchField(selectedTab.id, selectedField.id, { choices });
  };

  const removeChoice = (index) => {
    if (!selectedTab || !selectedField) return;
    const choices = [...(selectedField.choices || [])];
    choices.splice(index, 1);
    patchField(selectedTab.id, selectedField.id, { choices });
  };

  const addChoice = () => {
    if (!selectedTab || !selectedField) return;
    const choices = [...(selectedField.choices || []), 'New Choice'];
    patchField(selectedTab.id, selectedField.id, { choices });
  };

  const defaultValueStr =
    selectedField && typeof selectedField.defaultValue === 'boolean'
      ? String(selectedField.defaultValue)
      : selectedField
        ? String(selectedField.defaultValue ?? '')
        : '';

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrap}>Loading form…</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {loadError ? <div className={styles.loadBanner}>{loadError}</div> : null}
      <div className={styles.top}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tabChip} ${tab.id === selectedTabId ? styles.tabChipActive : ''}`}
          >
            <button type="button" className={styles.tabNameBtn} onClick={() => handleSelectTab(tab)}>
              {tab.name}
            </button>
            <button type="button" className={styles.tabActionBtn} onClick={() => handleRenameTab(tab)}>
              Rename
            </button>
            <button
              type="button"
              className={`${styles.tabActionBtn} ${styles.deleteBtn}`}
              onClick={() => handleDeleteTab(tab)}
            >
              Delete
            </button>
          </div>
        ))}
        <button type="button" className={styles.addTabBtn} onClick={handleAddTab}>
          + Add Tab
        </button>
        <Button type="button" variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>

      <div className={styles.body}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Field Properties</h2>
          <div className={styles.panelContent}>
            <div className={styles.editorSection}>
              {!selectedField ? (
                <div className={styles.emptyNote}>Select a field to edit its properties.</div>
              ) : (
                <>
                  <Input
                    label="Name"
                    value={selectedField.name}
                    onChange={(e) => patchField(selectedTab.id, selectedField.id, { name: e.target.value })}
                  />
                  <Input
                    label="Title"
                    value={selectedField.title}
                    onChange={(e) => patchField(selectedTab.id, selectedField.id, { title: e.target.value })}
                  />
                  <Select
                    label="Type"
                    value={selectedField.type}
                    onChange={handleFieldTypeChange}
                    options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
                  />

                  {selectedField.type === 'dropdown' && (
                    <div>
                      <div className={styles.choicesBlock}>
                        {(selectedField.choices || []).map((c, idx) => (
                          <div key={idx} className={styles.choiceRow}>
                            <input
                              type="text"
                              value={c}
                              onChange={(e) => updateChoice(idx, e.target.value)}
                            />
                            <button type="button" className={styles.choiceRemove} onClick={() => removeChoice(idx)}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" onClick={addChoice}>
                        + Add Choice
                      </Button>
                    </div>
                  )}

                  <Input
                    label="Default Value (String)"
                    value={defaultValueStr}
                    onChange={(e) => patchField(selectedTab.id, selectedField.id, { defaultValue: e.target.value })}
                  />

                  <div className={styles.checks}>
                    <label className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(e) =>
                          patchField(selectedTab.id, selectedField.id, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                    <label className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={selectedField.readonly}
                        onChange={(e) =>
                          patchField(selectedTab.id, selectedField.id, { readonly: e.target.checked })
                        }
                      />
                      Readonly
                    </label>
                  </div>
                </>
              )}
            </div>

            <hr className={styles.divider} />

            <div className={styles.fieldList}>
              {!selectedTab || selectedTab.fields.length === 0 ? (
                <div className={styles.emptyNote}>No fields yet.</div>
              ) : (
                selectedTab.fields.map((f) => (
                  <div
                    key={f.id}
                    className={`${styles.fieldItem} ${f.id === selectedFieldId ? styles.fieldItemActive : ''}`}
                    onClick={() => setSelectedFieldId(f.id)}
                    role="presentation"
                  >
                    <div>
                      {f.title} ({f.type})
                    </div>
                    <button
                      type="button"
                      className={styles.fieldRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveField(f.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className={styles.addFieldBtn}
              onClick={handleAddField}
            >
              + Add Field
            </Button>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Live Form Preview</h2>
          <div className={styles.panelContent}>
            {!selectedTab ? (
              <div className={styles.emptyNote}>No tab selected.</div>
            ) : (
              <>
                <h3 className={styles.previewTitle}>{selectedTab.name} — Form Preview</h3>
                <div className={styles.previewForm}>
                  {selectedTab.fields.length === 0 ? (
                    <div className={styles.emptyNote}>No fields yet.</div>
                  ) : (
                    selectedTab.fields.map((f) => (
                      <PreviewField
                        key={f.id}
                        field={f}
                        isSelected={f.id === selectedFieldId}
                        onSelect={() => setSelectedFieldId(f.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
