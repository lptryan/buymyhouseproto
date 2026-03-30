import { useState, useCallback } from 'react';
import type { FunnelState, Motivation, Timeline, Condition, Agent } from '@/lib/types';
import { playWhooshSound } from '@/lib/sounds';

const initialState: FunnelState = {
  currentStage: 1,
  address: '',
  city: '',
  state: '',
  zip: '',
  motivation: null,
  timeline: null,
  condition: null,
  name: '',
  email: '',
  phone: '',
  agentId: null,
  agent: null,
};

export function useFunnel() {
  const [state, setState] = useState<FunnelState>(initialState);

  const goToStage = useCallback((stage: number) => {
    setState(prev => ({ ...prev, currentStage: stage }));
  }, []);

  const setAddress = useCallback((address: string, city: string, stateCode: string, zip: string) => {
    setState(prev => ({ ...prev, address, city, state: stateCode, zip }));
  }, []);

  const setMotivation = useCallback((motivation: Motivation) => {
    setState(prev => ({ ...prev, motivation }));
  }, []);

  const setTimeline = useCallback((timeline: Timeline) => {
    setState(prev => ({ ...prev, timeline }));
  }, []);

  const setCondition = useCallback((condition: Condition) => {
    setState(prev => ({ ...prev, condition }));
  }, []);

  const setIdentity = useCallback((name: string, email: string, phone: string) => {
    setState(prev => ({ ...prev, name, email, phone }));
  }, []);

  const setAgent = useCallback((agentId: string, agent?: Agent) => {
    setState(prev => ({ ...prev, agentId, agent: agent || prev.agent }));
  }, []);

  const setQualification = useCallback((motivation: Motivation, timeline: Timeline, condition: Condition) => {
    setState(prev => ({ ...prev, motivation, timeline, condition }));
  }, []);

  return {
    state,
    goToStage,
    setAddress,
    setMotivation,
    setTimeline,
    setCondition,
    setIdentity,
    setAgent,
    setQualification,
  };
}
