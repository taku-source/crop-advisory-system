import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { SEASON_STAGES, ACTIVITY_DETAIL, SYMPTOMS, DISEASES } from '../constants/data';

// ─── SeasonPlanScreen ─────────────────────────────────────────────────────────
export function SeasonPlanScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}><Text style={s.hdrTitle}>Seasonal Plan</Text><Text style={s.hdrSub}>2024/25</Text></View>
      <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

        {/* Crop header */}
        <View style={s.cropHdr}>
          <Text style={s.chEmoji}>🌽</Text>
          <View>
            <Text style={s.chName}>Maize</Text>
            <Text style={s.chMeta}>Kadoma · Sandy Loam · 2 ha</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={s.progCard}>
          <Text style={s.progLbl}>Season Progress</Text>
          <View style={s.progTrack}><View style={s.progFill} /></View>
          <Text style={s.progPct}>30% — Planting stage</Text>
        </View>

        {/* Stage list */}
        {SEASON_STAGES.map((stage, idx) => {
          const isLast = idx === SEASON_STAGES.length - 1;
          return (
            <TouchableOpacity
              key={stage.id}
              style={s.stageRow}
              onPress={() => stage.status === 'current' && navigation.navigate('ActivityDetail', { stageId: stage.id })}
              activeOpacity={stage.status === 'current' ? 0.8 : 1}
            >
              <View style={s.siTrack}>
                <View style={[s.siDot, stage.status === 'done' && s.siDotDone, stage.status === 'current' && s.siDotCur, stage.status === 'upcoming' && s.siDotUp]}>
                  <Text style={s.siDotTxt}>{stage.status === 'done' ? '✓' : stage.status === 'current' ? '●' : '○'}</Text>
                </View>
                {!isLast && <View style={[s.siLine, stage.status === 'done' && s.siLineDone]} />}
              </View>
              <View style={s.siBody}>
                <Text style={[s.siName, stage.status === 'current' && s.siNameCur, stage.status === 'done' && s.siNameDone]}>{stage.name}</Text>
                <Text style={s.siPeriod}>{stage.period}</Text>
                <View style={[s.siBadge, stage.status === 'done' && s.sBgDone, stage.status === 'current' && s.sBgCur, stage.status === 'upcoming' && s.sBgUp]}>
                  <Text style={[s.siBadgeTxt, stage.status === 'done' && s.sTxtDone, stage.status === 'current' && s.sTxtCur, stage.status === 'upcoming' && s.sTxtUp]}>
                    {stage.status === 'done' ? '✓ Completed' : stage.status === 'current' ? '● Current Stage' : 'Upcoming'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <BottomNav active="SeasonPlan" navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── ActivityDetailScreen ─────────────────────────────────────────────────────
export function ActivityDetailScreen({ navigation, route }) {
  const detail = ACTIVITY_DETAIL.planting;
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Season Plan</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 10 }}>
          <View style={s.tag}><Text style={s.tagTxt}>🌽 Maize</Text></View>
          <Text style={s.adTitle}>{detail.title}</Text>
          <View style={s.adMeta}>
            <View style={s.pillCur}><Text style={s.pillCurTxt}>● Current Stage</Text></View>
            <Text style={s.adPeriod}>{detail.period}</Text>
          </View>
        </View>

        <Text style={s.secLbl}>What to do</Text>
        <View style={s.infoBox}><Text style={s.infoBody}>{detail.what}</Text></View>

        <Text style={s.secLbl}>Soil considerations</Text>
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🟤 Sandy Loam — Your soil</Text>
          <Text style={s.infoBody}>{detail.soil}</Text>
        </View>

        <Text style={s.secLbl}>Weather considerations</Text>
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🌧 Rain forecast — Kadoma</Text>
          <Text style={s.infoBody}>{detail.weather}</Text>
        </View>

        <Text style={s.secLbl}>Why this recommendation</Text>
        <View style={s.whyCard}><Text style={s.whyText}>{detail.why}</Text></View>

        <View style={s.sourceBox}><Text style={s.sourceTxt}>📖 Source: {detail.source}</Text></View>

        <TouchableOpacity style={s.markBtn} activeOpacity={0.85}>
          <Text style={s.markBtnTxt}>✓ Mark as Completed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DiseaseIDScreen ──────────────────────────────────────────────────────────
export function DiseaseIDScreen({ navigation }) {
  const [crop, setCrop]               = useState('maize');
  const [symptoms, setSymptoms]       = useState([]);
  const [results, setResults]         = useState(null);
  const [cropOpen, setCropOpen]       = useState(false);
  const CROPS = [{ id: 'maize', label: '🌽 Maize' }, { id: 'tomato', label: '🍅 Tomato' }, { id: 'beans', label: '🫘 Beans' }];

  const toggleSym = (s) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const identify = () => {
    const diseases = DISEASES[crop] || [];
    const scored = diseases.map(d => {
      const matched = symptoms.filter(s => d.symptoms.some(ds => ds.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ds.toLowerCase())));
      const score = symptoms.length > 0 ? Math.round((matched.length / symptoms.length) * 100) : 0;
      return { ...d, matched, score };
    }).filter(d => d.score > 0).sort((a,b) => b.score - a.score);
    setResults(scored);
  };

  const reset = () => { setSymptoms([]); setResults(null); };
  const cropSymptoms = SYMPTOMS[crop] || [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}><Text style={s.hdrTitle}>Disease ID</Text></View>
      <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

        {/* Crop selector */}
        <TouchableOpacity style={s.cropSel} onPress={() => setCropOpen(!cropOpen)}>
          <View><Text style={s.csDcsLbl}>Crop</Text><Text style={s.csDcsVal}>{CROPS.find(c=>c.id===crop)?.label}</Text></View>
          <Text style={{ color: Colors.grey }}>▾</Text>
        </TouchableOpacity>
        {cropOpen && (
          <View style={s.dropdown}>
            {CROPS.map(c => (
              <TouchableOpacity key={c.id} style={s.dropItem} onPress={() => { setCrop(c.id); setCropOpen(false); setSymptoms([]); setResults(null); }}>
                <Text style={s.dropTxt}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!results ? (
          <>
            <Text style={s.secLbl}>What symptoms are you seeing?</Text>
            <View style={s.symGrid}>
              {cropSymptoms.map(sym => (
                <TouchableOpacity key={sym} style={[s.symChip, symptoms.includes(sym) && s.symSel]} onPress={() => toggleSym(sym)} activeOpacity={0.8}>
                  <Text style={[s.symTxt, symptoms.includes(sym) && s.symTxtSel]}>{sym}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.symCount}>{symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} selected</Text>
            <TouchableOpacity style={[s.identifyBtn, symptoms.length === 0 && { opacity: 0.4 }]} onPress={identify} disabled={symptoms.length === 0} activeOpacity={0.85}>
              <Text style={s.identifyTxt}>Identify Disease</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.secLbl}>Possible Matches</Text>
            {results.length === 0 && (
              <View style={s.noMatch}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🤔</Text>
                <Text style={s.noMatchTitle}>No Match Found</Text>
                <Text style={s.noMatchBody}>No diseases matched. Consult your local Agritex Extension Officer.</Text>
              </View>
            )}
            {results.map((d, i) => (
              <TouchableOpacity key={d.id} style={[s.matchCard, i === 0 && s.matchCardTop]} onPress={() => navigation.navigate('DiseaseDetail', { disease: d })} activeOpacity={0.8}>
                <View style={s.matchHdr}>
                  <Text style={s.matchName}>{d.name}</Text>
                  <View style={[s.sevBadge, d.severity === 'High' ? s.sevH : s.sevM]}>
                    <Text style={s.sevTxt}>{d.severity}</Text>
                  </View>
                </View>
                <Text style={s.matchPct}>{d.score}% symptom match</Text>
                <View style={s.matchBar}><View style={[s.matchFill, { width: `${d.score}%` }]} /></View>
                <Text style={s.matchSub}>{d.matched.length} of {symptoms.length} selected symptoms matched</Text>
                <View style={s.matchSyms}>
                  {symptoms.map(sym => (
                    <View key={sym} style={[s.matchSym, d.matched.includes(sym) && s.matchSymM]}>
                      <Text style={[s.matchSymTxt, d.matched.includes(sym) && s.matchSymTxtM]}>
                        {d.matched.includes(sym) ? '✓' : '✗'} {sym}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.85}>
              <Text style={s.resetTxt}>Start New Identification</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <BottomNav active="DiseaseID" navigation={navigation} />
    </SafeAreaView>
  );
}

// ─── DiseaseDetailScreen ──────────────────────────────────────────────────────
export function DiseaseDetailScreen({ navigation, route }) {
  const { disease } = route.params;
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Disease ID</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={s.ddHero}>
          <View style={s.tag}><Text style={s.tagTxt}>🌽 Maize</Text></View>
          <Text style={s.ddName}>{disease.name}</Text>
          <View style={[s.sevBadge, disease.severity === 'High' ? s.sevH : s.sevM]}>
            <Text style={s.sevTxt}>⚠️ {disease.severity} Severity</Text>
          </View>
        </View>

        <View style={s.matchHeroCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={s.mhPct}>{disease.score}%</Text>
              <Text style={s.mhLbl}>symptom match — not a diagnosis</Text>
            </View>
            <Text style={s.mhCount}>{disease.matched?.length} of {disease.matched?.length + 2} matched</Text>
          </View>
          <View style={s.mhBar}><View style={[s.mhFill, { width: `${disease.score}%` }]} /></View>
          <View style={s.matchSyms}>
            {(disease.symptoms || []).map(sym => (
              <View key={sym} style={[s.matchSym, s.matchSymM]}>
                <Text style={s.matchSymTxtM}>✓ {sym}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.warnBox}>
          <Text style={s.warnTxt}>⚠️ This is a symptom-based match, not a confirmed diagnosis. Consult your Agritex Extension Officer before taking action.</Text>
        </View>

        {[
          { label: 'Description', body: disease.description },
          { label: 'Causes',      body: disease.causes      },
        ].map(sec => (
          <View key={sec.label} style={{ marginBottom: 12 }}>
            <Text style={s.secLbl}>{sec.label}</Text>
            <Text style={s.secBody}>{sec.body}</Text>
          </View>
        ))}

        <View style={s.treatBox}>
          <Text style={s.treatLbl}>Management</Text>
          <Text style={s.treatBody}>{disease.management}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={s.secLbl}>Prevention</Text>
          <Text style={s.secBody}>{disease.prevention}</Text>
        </View>

        <View style={s.sourceBox}><Text style={s.sourceTxt}>📖 Source: {disease.source}</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  hdr: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hdrTitle: { fontFamily: Fonts.display, fontSize: 22, fontWeight: '800', color: Colors.white },
  hdrSub: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey },
  back: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.leaf },

  // Season plan
  cropHdr: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chEmoji: { fontSize: 28 },
  chName: { fontFamily: Fonts.display, fontSize: 17, fontWeight: '800', color: Colors.white },
  chMeta: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey },
  progCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 14 },
  progLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 7 },
  progTrack: { height: 5, backgroundColor: Colors.muted, borderRadius: 3, marginBottom: 5 },
  progFill: { width: '30%', height: '100%', backgroundColor: Colors.leaf, borderRadius: 3 },
  progPct: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.leaf },
  stageRow: { flexDirection: 'row', gap: 13, paddingVertical: 11 },
  siTrack: { alignItems: 'center' },
  siDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border },
  siDotDone: { backgroundColor: Colors.leaf, borderColor: Colors.leaf },
  siDotCur: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  siDotUp: { backgroundColor: Colors.muted, borderColor: Colors.muted },
  siDotTxt: { fontSize: 11, color: Colors.white, fontFamily: Fonts.bold },
  siLine: { width: 2, flex: 1, minHeight: 14, backgroundColor: Colors.border, marginVertical: 3 },
  siLineDone: { backgroundColor: Colors.leaf },
  siBody: { flex: 1, paddingTop: 3 },
  siName: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white, marginBottom: 2 },
  siNameCur: { color: Colors.leaf },
  siNameDone: { color: Colors.grey },
  siPeriod: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },
  siBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 2, borderRadius: 20, marginTop: 4 },
  sBgDone: { backgroundColor: 'rgba(74,222,128,.12)' },
  sBgCur: { backgroundColor: 'rgba(74,222,128,.2)' },
  sBgUp: { backgroundColor: Colors.muted },
  siBadgeTxt: { fontFamily: Fonts.mono, fontSize: 10 },
  sTxtDone: { color: Colors.leaf },
  sTxtCur: { color: Colors.leaf },
  sTxtUp: { color: Colors.grey },

  // Activity detail
  tag: { backgroundColor: Colors.leafDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#2a5a3a', alignSelf: 'flex-start', marginBottom: 8 },
  tagTxt: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 0.7, textTransform: 'uppercase' },
  adTitle: { fontFamily: Fonts.display, fontSize: 26, fontWeight: '800', color: Colors.white, lineHeight: 30, marginBottom: 8 },
  adMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  pillCur: { backgroundColor: 'rgba(74,222,128,.2)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  pillCurTxt: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf },
  adPeriod: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey },
  secLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 7 },
  infoBox: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: 13, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  infoTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.grey2, marginBottom: 5 },
  infoBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey, lineHeight: 20 },
  whyCard: { backgroundColor: 'rgba(74,222,128,.06)', borderWidth: 1, borderColor: 'rgba(74,222,128,.2)', borderRadius: Radius.md, padding: 13, marginBottom: 12 },
  whyText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, lineHeight: 20 },
  sourceBox: { backgroundColor: Colors.surface, borderRadius: 9, padding: 10, marginBottom: 14 },
  sourceTxt: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey },
  markBtn: { backgroundColor: Colors.leaf, borderRadius: 12, padding: 14, alignItems: 'center' },
  markBtnTxt: { fontFamily: Fonts.bold, fontSize: 15, color: '#041a0a' },

  // Disease ID
  cropSel: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  csDcsLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, textTransform: 'uppercase', letterSpacing: 0.7 },
  csDcsVal: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.white, marginTop: 2 },
  dropdown: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, overflow: 'hidden' },
  dropItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropTxt: { fontFamily: Fonts.body, fontSize: 14, color: Colors.white },
  symGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  symChip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7 },
  symSel: { backgroundColor: Colors.leafDim, borderColor: Colors.leaf },
  symTxt: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.white },
  symTxtSel: { color: Colors.leaf },
  symCount: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey, textAlign: 'center', marginBottom: 12 },
  identifyBtn: { backgroundColor: Colors.leaf, borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 4 },
  identifyTxt: { fontFamily: Fonts.bold, fontSize: 14, color: '#041a0a' },
  noMatch: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 28, alignItems: 'center', marginBottom: 14 },
  noMatchTitle: { fontFamily: Fonts.display, fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  noMatchBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey, textAlign: 'center', lineHeight: 19 },
  matchCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 15, marginBottom: 9 },
  matchCardTop: { borderColor: 'rgba(74,222,128,.4)', backgroundColor: Colors.leafDim },
  matchHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 },
  matchName: { fontFamily: Fonts.display, fontSize: 16, fontWeight: '700', color: Colors.white, flex: 1 },
  sevBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  sevH: { backgroundColor: 'rgba(248,113,113,.15)' },
  sevM: { backgroundColor: 'rgba(251,191,36,.15)' },
  sevTxt: { fontFamily: Fonts.monoBold, fontSize: 10, color: Colors.danger },
  matchPct: { fontFamily: Fonts.monoBold, fontSize: 11, color: Colors.leaf },
  matchBar: { height: 4, backgroundColor: Colors.muted, borderRadius: 2, marginTop: 3, marginBottom: 3 },
  matchFill: { height: '100%', backgroundColor: Colors.leaf, borderRadius: 2 },
  matchSub: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey, marginBottom: 8 },
  matchSyms: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  matchSym: { backgroundColor: Colors.muted, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  matchSymM: { backgroundColor: 'rgba(74,222,128,.12)' },
  matchSymTxt: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.grey },
  matchSymTxtM: { color: Colors.leaf, fontFamily: Fonts.mono, fontSize: 10 },
  resetBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 6 },
  resetTxt: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white },

  // Disease detail
  ddHero: { backgroundColor: '#1a0a0a', borderWidth: 1, borderColor: 'rgba(248,113,113,.2)', borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: 12 },
  ddName: { fontFamily: Fonts.display, fontSize: 24, fontWeight: '800', color: Colors.white, marginVertical: 8 },
  matchHeroCard: { backgroundColor: Colors.leafDim, borderWidth: 1, borderColor: 'rgba(74,222,128,.3)', borderRadius: Radius.md, padding: 14, marginBottom: 12 },
  mhPct: { fontFamily: Fonts.display, fontSize: 26, fontWeight: '800', color: Colors.leaf },
  mhLbl: { fontFamily: Fonts.body, fontSize: 11, color: Colors.grey2, marginTop: 1 },
  mhCount: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.grey },
  mhBar: { height: 5, backgroundColor: Colors.muted, borderRadius: 3, marginTop: 9 },
  mhFill: { height: '100%', backgroundColor: Colors.leaf, borderRadius: 3 },
  warnBox: { backgroundColor: '#1a0808', borderWidth: 1, borderColor: 'rgba(248,113,113,.2)', borderRadius: Radius.md, padding: 12, marginBottom: 14 },
  warnTxt: { fontFamily: Fonts.body, fontSize: 12, color: '#fca5a5', lineHeight: 18 },
  secBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.grey2, lineHeight: 21 },
  treatBox: { backgroundColor: '#0d2010', borderWidth: 1, borderColor: 'rgba(74,222,128,.25)', borderRadius: Radius.md, padding: 14 },
  treatLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.leaf, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 6 },
  treatBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.white, lineHeight: 21 },
});
