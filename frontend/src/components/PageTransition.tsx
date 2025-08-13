
import { motion, cubicBezier } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 20, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0,  filter: "blur(0px)" },
  exit:    { opacity: 0, y: -20, filter: "blur(6px)" },
};

const transition = {
  duration: 0.65,
  ease: cubicBezier(0.22, 1, 0.36, 1),
};

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function PageTransition({ className = "", children }: Props) {
  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.main>
  );
}
