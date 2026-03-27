import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFunnel } from '@/hooks/useFunnel';
import { fetchAgentByZip, submitLead } from '@/lib/queries';
import Stage1Hero from './Stage1Hero';
import Stage3Evaluation from './Stage3Evaluation';
import Stage4Qualification from './Stage4Qualification';
import Stage5Identity from './Stage5Identity';
import Stage6Agent from './Stage6Agent';
import Stage7Confirmation from './Stage7Confirmation';
import type { Motivation, Timeline, Condition } from '@/lib/types';
import { toast } from 'sonner';

const stageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const stageTransition = {
  duration: 0.4,
  ease: [0.34, 1.3, 0.64, 1] as [number, number, number, number],
};

export default function FunnelContainer() {
  const funnel = useFunnel();
  const { currentStage } = funnel.state;
  const [submitting, setSubmitting] = useState(false);

  const renderStage = () => {
    switch (currentStage) {
      case 1:
      case 2:
        return (
          <motion.div
            key="stage1-2"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage1Hero
              onSubmitAddress={(address, city, state, zip) => {
                funnel.setAddress(address, city, state, zip);
                funnel.goToStage(2);
              }}
              onContinueToAssessment={() => funnel.goToStage(3)}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="stage3"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage3Evaluation
              address={funnel.state.address}
              onComplete={() => funnel.goToStage(4)}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="stage4"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage4Qualification
              address={funnel.state.address}
              onComplete={(motivation: Motivation, timeline: Timeline, condition: Condition) => {
                funnel.setQualification(motivation, timeline, condition);
                funnel.goToStage(5);
              }}
              onBack={() => funnel.goToStage(3)}
            />
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="stage5"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage5Identity
              address={funnel.state.address}
              onComplete={async (name, email, phone) => {
                funnel.setIdentity(name, email, phone);
                // Fetch matching agent
                const zip = funnel.state.zip || funnel.state.address.match(/\d{5}/)?.[0] || '';
                const agent = await fetchAgentByZip(zip);
                if (agent) {
                  funnel.setAgent(agent.id, agent);
                }
                funnel.goToStage(6);
              }}
            />
          </motion.div>
        );
      case 6:
        return (
          <motion.div
            key="stage6"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage6Agent
              address={funnel.state.address}
              agent={funnel.state.agent}
              onConfirm={async () => {
                if (submitting) return;
                setSubmitting(true);
                try {
                  await submitLead({
                    address: funnel.state.address,
                    city: funnel.state.city,
                    state: funnel.state.state,
                    zip: funnel.state.zip,
                    motivation: funnel.state.motivation,
                    timeline: funnel.state.timeline,
                    condition: funnel.state.condition,
                    name: funnel.state.name,
                    email: funnel.state.email,
                    phone: funnel.state.phone,
                    agentId: funnel.state.agentId,
                  });
                  funnel.goToStage(7);
                } catch (err) {
                  console.error('Lead submission failed:', err);
                  toast.error('Something went wrong. Please try again.');
                  setSubmitting(false);
                }
              }}
            />
          </motion.div>
        );
      case 7:
        return (
          <motion.div
            key="stage7"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage7Confirmation
              address={funnel.state.address}
              agent={funnel.state.agent}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {renderStage()}
      </AnimatePresence>
    </div>
  );
}
