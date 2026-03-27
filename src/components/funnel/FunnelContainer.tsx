import { AnimatePresence, motion } from 'framer-motion';
import { useFunnel } from '@/hooks/useFunnel';
import Stage1Hero from './Stage1Hero';
import Stage3Evaluation from './Stage3Evaluation';

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

  const renderStage = () => {
    switch (currentStage) {
      // Stages 1 & 2 are on the same page (Stage 2 is below-fold scroll reveal)
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
                funnel.goToStage(2); // Stay on same page, Stage 2 reveals below
              }}
              onContinueToAssessment={() => {
                funnel.goToStage(3); // CTA in Stage 2 advances to Stage 3
              }}
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
      default:
        return (
          <motion.div
            key="placeholder"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
            className="flex items-center justify-center min-h-screen"
          >
            <div
              className="bg-card rounded-card p-8 text-center max-w-md"
              style={{
                boxShadow: '0 1px 3px rgba(27,43,75,0.06), 0 8px 24px rgba(27,43,75,0.08), 0 24px 48px rgba(27,43,75,0.06)',
              }}
            >
              <div className="h-[3px] accent-bar -mx-8 -mt-8 mb-6 rounded-t-card" />
              <h2 className="text-[18px] font-bold tracking-[-0.3px] mb-2" style={{ color: '#1B2B4B' }}>
                Stage {currentStage}
              </h2>
              <p className="text-[13px]" style={{ color: '#4A5E72' }}>
                Coming soon — use the iteration prompts to build this stage.
              </p>
            </div>
          </motion.div>
        );
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
