import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../../components/layout/PageLayout/PageLayout';
import Card from '../../../components/Card/Card';
import Tabs from '../../../components/Tabs/Tabs';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import * as initiativeService from '../../../services/initiative.service';
import { formatDateForInput } from '../../../utils/dateUtils';
import { normalizeInitiativeResponse } from './initiativeApiNormalize';
import { extractArrayByCandidates, extractObjectByCandidates } from './sectionExtractors';
import InitiativeTab from './tabs/InitiativeTab';
import SubmissionSummaryTab from './tabs/SubmissionSummaryTab';
import PartnershipOverviewTab from './tabs/PartnershipOverviewTab';
import SolutionOverviewTab from './tabs/SolutionOverviewTab';
import SolutionTeamStructureTab from './tabs/SolutionTeamStructureTab';
import AwsFeedbackTab from './tabs/AwsFeedbackTab';
import styles from './EditInitiativePage.module.scss';

const INITIATIVE_STATUS_OPTIONS = [
  { value: 'Created', label: 'Created' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Milestone 1', label: 'Milestone 1' },
  { value: 'Milestone 2', label: 'Milestone 2' },
  { value: 'Milestone 3', label: 'Milestone 3' },
];

function toIntInput(v) {
  if (v === null || v === undefined || v === '') return '';
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  return Number.isNaN(n) ? '' : String(n);
}

function toStringInput(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function toDateInput(v) {
  if (!v) return '';
  return formatDateForInput(v);
}

function toBoolInput(v) {
  return Boolean(v);
}

function toIntPayload(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function toStringPayload(v) {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s.trim() === '' ? null : s;
}

function toDatePayload(v) {
  if (!v) return null;
  return String(v);
}

function normalizeInitiativeRoot(api, initiativeId) {
  return {
    initiativeId: toIntInput(api?.initiativeId ?? api?.id ?? initiativeId),
    description: toStringInput(api?.description),
    status: toStringInput(api?.status),
  };
}

function normalizeSubmissionSummary(ss) {
  return {
    id: toIntInput(ss?.id),
    initiativeHeaderId: toIntInput(ss?.initiativeHeaderId),
    submitterName: toStringInput(ss?.submitterName),
    submitterContact: toStringInput(ss?.submitterContact),
    dateSubmitted: toDateInput(ss?.dateSubmitted),
    leadPartner: toStringInput(ss?.leadPartner),
    supportingPartners: toStringInput(ss?.supportingPartners),
    customerUseCase: toStringInput(ss?.customerUseCase),
    awsServices: toStringInput(ss?.awsServices),
    expectedLaunchDate: toDateInput(ss?.expectedLaunchDate),
    publicSector: toBoolInput(ss?.publicSector),
    businessOutcomes: toBoolInput(ss?.businessOutcomes),
    targetIndustry: toStringInput(ss?.targetIndustry),
    targetPersona: toStringInput(ss?.targetPersona),
  };
}

function normalizePartner(p) {
  return {
    id: toIntInput(p?.id),
    initiativeHeaderId: toIntInput(p?.initiativeHeaderId),
    partnerName: toStringInput(p?.partnerName),
    sfdcLink: toStringInput(p?.sfdcLink),
    apnSfdcLink: toStringInput(p?.apnSfdcLink),
    // Prompt requirement: partnerTier (date)
    partnerTier: toDateInput(p?.partnerTier),
    partnerSince: toDateInput(p?.partnerSince),
    businessPlanOwners: toStringInput(p?.businessPlanOwners),
    apnPrograms: toStringInput(p?.apnPrograms),
    officeLocations: toStringInput(p?.officeLocations),
    keyFocusVerticals: toStringInput(p?.keyFocusVerticals),
    competencies: toStringInput(p?.competencies),
  };
}

function normalizeSolutionOverview(s) {
  return {
    id: toIntInput(s?.id),
    initiativeHeaderId: toIntInput(s?.initiativeHeaderId),
    executiveSummary: toStringInput(s?.executiveSummary),
    description: toStringInput(s?.description),
    technology: toStringInput(s?.technology),
    marketFit: toStringInput(s?.marketFit),
    marketingStrategy: toStringInput(s?.marketingStrategy),
    teamStructure: toStringInput(s?.teamStructure),
    schedule: toStringInput(s?.schedule),
    financials: toStringInput(s?.financials),
    architecture: toStringInput(s?.architecture),
    customerTargets: toStringInput(s?.customerTargets),
    findings: toStringInput(s?.findings),
  };
}

function normalizeSolutionTeamStructure(s) {
  return {
    id: toIntInput(s?.id),
    initiativeHeaderId: toIntInput(s?.initiativeHeaderId),
    supportModel: toStringInput(s?.supportModel),
    opportunityGeneration: toStringInput(s?.opportunityGeneration),
    commercialAgreement: toStringInput(s?.commercialAgreement),
  };
}

function normalizeAwsFeedback(f) {
  return {
    id: toIntInput(f?.id),
    initiativeHeaderId: toIntInput(f?.initiativeHeaderId),
    awsFeedback: toStringInput(f?.awsFeedback),
  };
}

function payloadForSubmissionSummary(v) {
  return {
    id: toIntPayload(v.id),
    initiativeHeaderId: toIntPayload(v.initiativeHeaderId),
    submitterName: toStringPayload(v.submitterName),
    submitterContact: toStringPayload(v.submitterContact),
    dateSubmitted: toDatePayload(v.dateSubmitted),
    leadPartner: toStringPayload(v.leadPartner),
    supportingPartners: toStringPayload(v.supportingPartners),
    customerUseCase: toStringPayload(v.customerUseCase),
    awsServices: toStringPayload(v.awsServices),
    expectedLaunchDate: toDatePayload(v.expectedLaunchDate),
    publicSector: Boolean(v.publicSector),
    businessOutcomes: Boolean(v.businessOutcomes),
    targetIndustry: toStringPayload(v.targetIndustry),
    targetPersona: toStringPayload(v.targetPersona),
  };
}

function payloadForPartner(p) {
  return {
    id: toIntPayload(p.id),
    initiativeHeaderId: toIntPayload(p.initiativeHeaderId),
    partnerName: toStringPayload(p.partnerName),
    sfdcLink: toStringPayload(p.sfdcLink),
    apnSfdcLink: toStringPayload(p.apnSfdcLink),
    partnerTier: toDatePayload(p.partnerTier),
    partnerSince: toDatePayload(p.partnerSince),
    businessPlanOwners: toStringPayload(p.businessPlanOwners),
    apnPrograms: toStringPayload(p.apnPrograms),
    officeLocations: toStringPayload(p.officeLocations),
    keyFocusVerticals: toStringPayload(p.keyFocusVerticals),
    competencies: toStringPayload(p.competencies),
  };
}

function payloadForSolutionOverview(v) {
  return {
    id: toIntPayload(v.id),
    initiativeHeaderId: toIntPayload(v.initiativeHeaderId),
    executiveSummary: toStringPayload(v.executiveSummary),
    description: toStringPayload(v.description),
    technology: toStringPayload(v.technology),
    marketFit: toStringPayload(v.marketFit),
    marketingStrategy: toStringPayload(v.marketingStrategy),
    teamStructure: toStringPayload(v.teamStructure),
    schedule: toStringPayload(v.schedule),
    financials: toStringPayload(v.financials),
    architecture: toStringPayload(v.architecture),
    customerTargets: toStringPayload(v.customerTargets),
    findings: toStringPayload(v.findings),
  };
}

function payloadForSolutionTeamStructure(v) {
  return {
    id: toIntPayload(v.id),
    initiativeHeaderId: toIntPayload(v.initiativeHeaderId),
    supportModel: toStringPayload(v.supportModel),
    opportunityGeneration: toStringPayload(v.opportunityGeneration),
    commercialAgreement: toStringPayload(v.commercialAgreement),
  };
}

function payloadForAwsFeedback(v) {
  return {
    id: toIntPayload(v.id),
    initiativeHeaderId: toIntPayload(v.initiativeHeaderId),
    awsFeedback: toStringPayload(v.awsFeedback),
  };
}

export default function EditInitiativePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initiativeId = id ? parseInt(id, 10) : null;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('initiative');

  const [initiative, setInitiative] = useState({
    initiativeId: '',
    description: '',
  });

  const [submissionSummary, setSubmissionSummary] = useState(normalizeSubmissionSummary(null));
  const [partnershipOverview, setPartnershipOverview] = useState([]);
  const [solutionOverview, setSolutionOverview] = useState(normalizeSolutionOverview(null));
  const [solutionTeamStructure, setSolutionTeamStructure] = useState(normalizeSolutionTeamStructure(null));
  const [awsFeedback, setAwsFeedback] = useState(normalizeAwsFeedback(null));

  const load = useCallback(async () => {
    if (!initiativeId) return;
    setLoading(true);
    setLoadError('');
    try {
      const raw = await initiativeService.getInitiative(initiativeId);
      const api = normalizeInitiativeResponse(raw);

      setInitiative(normalizeInitiativeRoot(api, initiativeId));

      const ss = extractObjectByCandidates(api, [
        'itSubmissionSummary',
        'itSubmissionSummaryVo',
        'submissionSummary',
        'submissionSummaryVo',
        'submission',
      ]);
      const partners = extractArrayByCandidates(api, [
        'itPartnershipOverview',
        'itPartnershipOverviewVo',
        'partnershipOverview',
        'partnerOverview',
        'partners',
      ]);
      const so = extractObjectByCandidates(api, [
        'itSolutionOverview',
        'itSolutionOverviewVo',
        'solutionOverview',
        'solution',
      ]);
      const st = extractObjectByCandidates(api, [
        'itSolutionTeamStructure',
        'itSolutionTeamStructureVo',
        'solutionTeamStructure',
        'teamStructure',
      ]);
      const af = extractObjectByCandidates(api, [
        'itAwsFeedback',
        'itAwsFeedbackVo',
        'awsFeedback',
        'awsTeamFeedback',
        'feedback',
      ]);

      setSubmissionSummary(normalizeSubmissionSummary(ss));
      setPartnershipOverview(partners.map((p) => normalizePartner(p)));
      setSolutionOverview(normalizeSolutionOverview(so));
      setSolutionTeamStructure(normalizeSolutionTeamStructure(st));
      setAwsFeedback(normalizeAwsFeedback(af));
    } catch (e) {
      console.error(e);
      setLoadError('Failed to load initiative');
    } finally {
      setLoading(false);
    }
  }, [initiativeId]);

  useEffect(() => {
    load();
  }, [load]);

  const title = useMemo(() => {
    const initId = initiative?.initiativeId ? String(initiative.initiativeId) : '';
    return '';
  }, [initiative]);

  const tabItems = useMemo(() => {
    return [
      {
        value: 'initiative',
        label: 'Initiative',
        content: (
          <InitiativeTab
            values={initiative}
            statusOptions={INITIATIVE_STATUS_OPTIONS}
            onChangeField={(name, value) => setInitiative((prev) => ({ ...prev, [name]: value }))}
          />
        ),
      },
      {
        value: 'submissionSummary',
        label: 'Submission summary',
        content: (
          <SubmissionSummaryTab
            values={submissionSummary}
            onChangeField={(name, value) => setSubmissionSummary((prev) => ({ ...prev, [name]: value }))}
          />
        ),
      },
      {
        value: 'partnershipOverview',
        label: 'Partnership overview',
        content: (
          <PartnershipOverviewTab
            fields={{
              // partnershipOverview tab modal includes all section fields;
              // the table columns are fixed inside the component per prompt.
              // This prop is only informational for the modal labels.
            }}
            partners={partnershipOverview}
            setPartners={setPartnershipOverview}
          />
        ),
      },
      {
        value: 'solutionOverview',
        label: 'Solution overview',
        content: (
          <SolutionOverviewTab
            values={solutionOverview}
            onChangeField={(name, value) => setSolutionOverview((prev) => ({ ...prev, [name]: value }))}
          />
        ),
      },
      {
        value: 'solutionTeamStructure',
        label: 'Solution team structure',
        content: (
          <SolutionTeamStructureTab
            values={solutionTeamStructure}
            onChangeField={(name, value) => setSolutionTeamStructure((prev) => ({ ...prev, [name]: value }))}
          />
        ),
      },
      {
        value: 'awsFeedback',
        label: 'AWS feedback',
        content: <AwsFeedbackTab values={awsFeedback} onChangeField={(name, value) => setAwsFeedback((prev) => ({ ...prev, [name]: value }))} />,
      },
    ];
  }, [awsFeedback, initiative, partnershipOverview, solutionOverview, solutionTeamStructure, submissionSummary]);

  const handleSave = async () => {
    if (!initiativeId) return;

    setSaving(true);
    try {
      const payload = {
        initiativeId: toIntPayload(initiative.initiativeId),
        description: toStringPayload(initiative.description),
        status: toStringPayload(initiative.status),
        itSubmissionSummary: payloadForSubmissionSummary(submissionSummary),
        itPartnershipOverview: (partnershipOverview || []).map((p) => payloadForPartner(p)),
        itSolutionOverview: payloadForSolutionOverview(solutionOverview),
        itSolutionTeamStructure: payloadForSolutionTeamStructure(solutionTeamStructure),
        itAwsFeedback: payloadForAwsFeedback(awsFeedback),
      };

      await initiativeService.updateInitiative(initiativeId, payload);
      await load();
    } catch (e) {
      console.error(e);
      alert('Failed to save initiative');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title={title}>
      <Card title="Edit initiative">
        {loading ? (
          <div>Loading...</div>
        ) : loadError ? (
          <div className={styles.errorRow}>
            <div>{loadError}</div>
            <Button variant="outline" onClick={() => navigate('/initiatives')}>
              Back
            </Button>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onChange={setActiveTab} items={tabItems} />
            <div className={styles.pageFooter}>
              <Button type="button" variant="outline" onClick={() => navigate('/initiatives')}>
                Back
              </Button>
              <Button type="button" variant="primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </PageLayout>
  );
}

