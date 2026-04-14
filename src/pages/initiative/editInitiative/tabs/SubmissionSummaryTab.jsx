import Input from '../../../../components/Input/Input';
import styles from '../EditInitiativePage.module.scss';

export default function SubmissionSummaryTab({ values, onChangeField }) {
  return (
    <div className={styles.form}>
      <Input
        label="Submitter Name"
        value={values?.submitterName ?? ''}
        onChange={(e) => onChangeField('submitterName', e.target.value)}
      />
      <Input
        label="Submitter Contact"
        value={values?.submitterContact ?? ''}
        onChange={(e) => onChangeField('submitterContact', e.target.value)}
      />
      <Input
        label="Date Submitted"
        type="date"
        value={values?.dateSubmitted ?? ''}
        onChange={(e) => onChangeField('dateSubmitted', e.target.value)}
      />
      <Input
        label="Lead Partner"
        value={values?.leadPartner ?? ''}
        onChange={(e) => onChangeField('leadPartner', e.target.value)}
      />
      <Input
        label="Supporting Partners"
        value={values?.supportingPartners ?? ''}
        onChange={(e) => onChangeField('supportingPartners', e.target.value)}
      />
      <Input
        label="Customer Use Case"
        value={values?.customerUseCase ?? ''}
        onChange={(e) => onChangeField('customerUseCase', e.target.value)}
      />
      <Input
        label="AWS Services"
        value={values?.awsServices ?? ''}
        onChange={(e) => onChangeField('awsServices', e.target.value)}
      />
      <Input
        label="Expected Launch Date"
        type="date"
        value={values?.expectedLaunchDate ?? ''}
        onChange={(e) => onChangeField('expectedLaunchDate', e.target.value)}
      />

      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          id="publicSector"
          checked={Boolean(values?.publicSector)}
          onChange={(e) => onChangeField('publicSector', e.target.checked)}
        />
        <label htmlFor="publicSector">Public Sector</label>
      </div>

      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          id="businessOutcomes"
          checked={Boolean(values?.businessOutcomes)}
          onChange={(e) => onChangeField('businessOutcomes', e.target.checked)}
        />
        <label htmlFor="businessOutcomes">Business Outcomes</label>
      </div>

      <Input
        label="Target Industry"
        value={values?.targetIndustry ?? ''}
        onChange={(e) => onChangeField('targetIndustry', e.target.value)}
      />
      <Input
        label="Target Persona"
        value={values?.targetPersona ?? ''}
        onChange={(e) => onChangeField('targetPersona', e.target.value)}
      />
    </div>
  );
}

