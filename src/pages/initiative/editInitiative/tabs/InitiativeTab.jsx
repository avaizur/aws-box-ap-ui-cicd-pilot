import Input from '../../../../components/Input/Input';
import Select from '../../../../components/Select/Select';
import styles from '../EditInitiativePage.module.scss';

export default function InitiativeTab({ values, statusOptions, onChangeField }) {
  return (
    <div className={styles.form}>
      <Select
        label="Status"
        value={values?.status ?? ''}
        onChange={(e) => onChangeField('status', e.target.value)}
        options={statusOptions || []}
        placeholder="Select status"
      />

      <Input
        label="Description"
        value={values?.description ?? ''}
        onChange={(e) => onChangeField('description', e.target.value)}
      />
    </div>
  );
}

