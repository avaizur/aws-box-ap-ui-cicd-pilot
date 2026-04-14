import Input from '../../../../components/Input/Input';
import styles from '../EditInitiativePage.module.scss';

export default function SolutionOverviewTab({ values, onChangeField }) {
  return (
    <div className={styles.form}>
      <Input
        label="Executive Summary"
        value={values?.executiveSummary ?? ''}
        onChange={(e) => onChangeField('executiveSummary', e.target.value)}
      />
      <Input
        label="Description"
        value={values?.description ?? ''}
        onChange={(e) => onChangeField('description', e.target.value)}
      />
      <Input
        label="Technology"
        value={values?.technology ?? ''}
        onChange={(e) => onChangeField('technology', e.target.value)}
      />
      <Input
        label="Market Fit"
        value={values?.marketFit ?? ''}
        onChange={(e) => onChangeField('marketFit', e.target.value)}
      />
      <Input
        label="Marketing Strategy"
        value={values?.marketingStrategy ?? ''}
        onChange={(e) => onChangeField('marketingStrategy', e.target.value)}
      />
      <Input
        label="Team Structure"
        value={values?.teamStructure ?? ''}
        onChange={(e) => onChangeField('teamStructure', e.target.value)}
      />
      <Input
        label="Schedule"
        value={values?.schedule ?? ''}
        onChange={(e) => onChangeField('schedule', e.target.value)}
      />
      <Input
        label="Financials"
        value={values?.financials ?? ''}
        onChange={(e) => onChangeField('financials', e.target.value)}
      />
      <Input
        label="Architecture"
        value={values?.architecture ?? ''}
        onChange={(e) => onChangeField('architecture', e.target.value)}
      />
      <Input
        label="Customer Targets"
        value={values?.customerTargets ?? ''}
        onChange={(e) => onChangeField('customerTargets', e.target.value)}
      />
      <Input
        label="Findings"
        value={values?.findings ?? ''}
        onChange={(e) => onChangeField('findings', e.target.value)}
      />
    </div>
  );
}

