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
      case 1:
        return (
          <motion.div
            key="stage1"
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stageTransition}
          >
            <Stage1Hero
              onSubmitAddress={(address, city, state, zip) => {
                funnel.setAddress(address, city, state, zip);
                funnel.goToStage(3);
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
            <div className="bg-card rounded-card shadow-card p-8 text-center max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-2">Stage {currentStage}</h2>
              <p className="text-text-body text-sm">Coming soon — use the iteration prompts to build this stage.</p>
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
