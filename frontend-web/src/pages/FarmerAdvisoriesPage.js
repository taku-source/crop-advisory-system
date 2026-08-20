import React, { useState, useEffect } from 'react';
import { getSeasonalPlan, updateCropProgress } from '../api';
import { PageHeader, Button, Chip, toast } from '../components/UI';

export default function FarmerAdvisoriesPage() {
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const response = await getSeasonalPlan();
      const responsePlan = response.data.data;
      const nextPlans = responsePlan.plans || [responsePlan];
      setPlans(nextPlans);
      setPlan(nextPlans[0]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load seasonal plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleStage = async (stage) => {
    if (!plan || !stage.stageId) return;
    try {
      await updateCropProgress(stage.stageId, {
        crop: plan.crop,
        stageName: stage.stage,
        completed: !stage.completed
      });
      setPlan((current) => ({
        ...current,
        seasonalTimeline: current.seasonalTimeline.map((item) => item.stageId === stage.stageId ? { ...item, completed: !stage.completed } : item)
      }));
      toast.success(stage.completed ? `${stage.stage} marked as incomplete` : `${stage.stage} marked as complete`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update stage progress');
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  return (
    <div>
      <PageHeader title="Your Seasonal Plan" action={<Button onClick={loadPlan}>Refresh</Button>} />
      {loading ? <div style={{ color: '#9fbfa8' }}>Building your plan from farm knowledge and local weather...</div> : !plan ? (
        <div style={{ color: '#9fbfa8' }}>No seasonal plan is available yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {plans.length > 1 && (
            <section style={{ background: '#0f231a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
              <div style={{ color: '#9fbfa8', fontSize: 12, marginBottom: 10 }}>Your selected crops</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {plans.map((cropPlan) => (
                  <button key={cropPlan.crop} type="button" onClick={() => setPlan(cropPlan)} style={{ background: cropPlan.crop === plan.crop ? '#2e7d32' : '#122916', color: '#ffffff', border: `1px solid ${cropPlan.crop === plan.crop ? '#69f0ae' : '#2f4d3c'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontWeight: 700 }}>
                    {cropPlan.crop}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section style={{ background: 'linear-gradient(135deg, #102414, #1b3a1f)', border: '1px solid #24462f', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#8ee4a4', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>{plan.region}</div>
                <h2 style={{ color: '#ffffff', margin: '8px 0' }}>{plan.crop} seasonal plan</h2>
                <div style={{ color: '#b8d9ba', fontSize: 13 }}>{plan.season} · {plan.farmerContext?.soilType || 'Soil profile pending'} soil</div>
              </div>
              <Chip color="green">{plan.currentStatus?.stage || 'Pre-planting'}</Chip>
            </div>
            <p style={{ color: '#d8f2db', lineHeight: 1.6, marginBottom: 0 }}>{plan.currentStatus?.message}</p>
          </section>

          <section style={{ background: '#0f231a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22 }}>
            <h3 style={{ color: '#ffffff', marginTop: 0 }}>Your next actions</h3>
            {plan.currentActions?.length ? plan.currentActions.map((action, index) => (
              <div key={`${action.activity}-${index}`} style={{ background: '#122916', borderRadius: 12, padding: 14, marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ color: '#ffffff' }}>{action.activity}</strong>
                  <Chip color={action.priority === 'high' ? 'orange' : 'blue'}>{action.priority}</Chip>
                </div>
                <p style={{ color: '#cfd9c8', lineHeight: 1.6, margin: '8px 0' }}>{action.description}</p>
                <div style={{ color: '#9fbfa8', fontSize: 12 }}>Why: {action.reason}</div>
                <div style={{ color: '#8ee4a4', fontSize: 11, marginTop: 6 }}>Source: {action.source}</div>
              </div>
            )) : <div style={{ color: '#9fbfa8' }}>Use the stage checklist below to keep your work in sync.</div>}
          </section>

          <section style={{ background: '#0f231a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22 }}>
            <h3 style={{ color: '#ffffff', marginTop: 0 }}>Verified crop guidance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ background: '#122916', borderRadius: 12, padding: 14 }}>
                <strong style={{ color: '#ffffff' }}>Planting setup</strong>
                {plan.cropGuidance?.planting?.spacingOptions?.map((option, index) => (
                  <div key={index} style={{ color: '#cfd9c8', fontSize: 12, marginTop: 8 }}>
                    Rows: {option.rowCm} cm · Within row: {option.withinRowCm} cm{option.approxPlantsPerHa ? ` · Approx. ${option.approxPlantsPerHa} plants/ha` : ''}
                  </div>
                ))}
                {plan.cropGuidance?.planting?.basinSpacingCm && <div style={{ color: '#cfd9c8', fontSize: 12, marginTop: 8 }}>Basins: {plan.cropGuidance.planting.basinSpacingCm.join(' x ')} cm</div>}
              </div>

              <div style={{ background: '#122916', borderRadius: 12, padding: 14 }}>
                <strong style={{ color: '#ffffff' }}>Fertilizer records</strong>
                {plan.cropGuidance?.fertilizer?.map((item, index) => (
                  <div key={index} style={{ color: '#cfd9c8', fontSize: 12, marginTop: 8 }}>
                    {item.type}: {item.rateKgPerHa ? `${item.rateKgPerHa} kg/ha` : 'Rate not stated'} · {item.description}
                  </div>
                ))}
              </div>

              <div style={{ background: '#122916', borderRadius: 12, padding: 14 }}>
                <strong style={{ color: '#ffffff' }}>Weed management</strong>
                <div style={{ color: '#cfd9c8', fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>{plan.cropGuidance?.weedManagement?.earlyControl || 'No verified weed timing recorded.'}</div>
                {plan.cropGuidance?.weedManagement?.methods?.length > 0 && <div style={{ color: '#9fbfa8', fontSize: 12, marginTop: 8 }}>Methods: {plan.cropGuidance.weedManagement.methods.join(', ')}</div>}
              </div>

              <div style={{ background: '#122916', borderRadius: 12, padding: 14 }}>
                <strong style={{ color: '#ffffff' }}>Pest thresholds</strong>
                {plan.cropGuidance?.pests?.map((pest) => (
                  <div key={pest.pestId} style={{ color: '#cfd9c8', fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
                    <div style={{ color: '#8ee4a4', fontWeight: 700 }}>{pest.pestName}</div>
                    {pest.thresholds?.map((threshold, index) => <div key={index}>{threshold.stage}: damage {threshold.damagePercent || 'not stated'}{threshold.eggMassPercent ? ` · egg masses ${threshold.eggMassPercent}` : ''}{threshold.action ? ` · ${threshold.action}` : ''}</div>)}
                    {pest.management?.length > 0 && <div>Management: {pest.management.join(', ')}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ color: '#8ee4a4', fontSize: 11, marginTop: 14 }}>
              Dataset: {plan.cropGuidance?.datasetName || 'Verified Region III dataset'} · Version {plan.cropGuidance?.datasetVersion || 'not stated'}
            </div>
          </section>

          <section style={{ background: '#0f231a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ color: '#ffffff', margin: 0 }}>Season stages</h3>
                <div style={{ color: '#9fbfa8', fontSize: 12, marginTop: 5 }}>Mark each stage when the work is finished.</div>
              </div>
              <Chip color="green">{plan.seasonalTimeline?.filter((stage) => stage.completed).length || 0}/{plan.seasonalTimeline?.length || 0} complete</Chip>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {plan.seasonalTimeline?.map((stage, index) => (
                <div key={`${stage.stageId || stage.stage}-${index}`} style={{ background: stage.completed ? '#173d26' : '#122916', border: `1px solid ${stage.completed ? '#45d483' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: 16 }}>{stage.stage}</strong>
                      <div style={{ color: '#9fbfa8', fontSize: 12, marginTop: 4 }}>{stage.daysAfterPlanting} days after planting</div>
                    </div>
                    <Button onClick={() => toggleStage(stage)} style={{ background: stage.completed ? '#24462f' : '#2e7d32', minWidth: 150 }}>
                      {stage.completed ? 'Mark as incomplete' : 'I have done this'}
                    </Button>
                  </div>
                  <p style={{ color: '#cfd9c8', margin: '10px 0', lineHeight: 1.5 }}>{stage.description}</p>
                  {stage.activities?.length > 0 && (
                    <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                      {stage.activities.map((activity, activityIndex) => (
                        <div key={`${activity.activityName}-${activityIndex}`} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>{activity.activityName}</div>
                          <div style={{ color: '#cfd9c8', fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{activity.description}</div>
                          {activity.timing && <div style={{ color: '#8ee4a4', fontSize: 11, marginTop: 3 }}>When: {activity.timing}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ color: '#8ee4a4', fontSize: 11, marginTop: 12 }}>Source: {stage.source}</div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ color: '#9fbfa8', fontSize: 12 }}>
            Agricultural guidance: {plan.references?.agriculturalKnowledge || 'Region III Agricultural Knowledge Base'}
            {plan.references?.agriculturalReference && ` · ${plan.references.agriculturalReference}`}
            {plan.references?.weatherData && ` · Weather context: ${plan.references.weatherData}`}
          </div>
        </div>
      )}
    </div>
  );
}
