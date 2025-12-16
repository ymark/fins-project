import { motion } from "framer-motion"; // 1. Import motion
import "./LandingPage.css";
import backgroundImage from "../assets/dark.jpg";
import desktopFish from "../assets/Group 1.png";
import logoImage from "../assets/logo.png";

interface LandingPageProps {
  onCtaClick: () => void;
}

// 2. Define Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Stagger the children's animation
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const logoVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

const textItemVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const fishVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.5 },
  },
};

export default function LandingPage({ onCtaClick }: LandingPageProps) {
  return (
    // We use motion.div for the main content block for entrance animation
    <div className="fins-container">
      {/* Background Image - Keep CSS animation for subtle, continuous effect */}
      <div className="fins-bg-container">
        <img src={backgroundImage} alt="Ocean background" className="" />
      </div>

      {/* Overlay */}
      <div className="fins-overlay bg-ocean-overlay" />

      {/* Content Container */}
      <div className="fins-content">
        {/* Header / Logo */}
        <motion.header
          className="fins-header"
          variants={logoVariants} // Apply logo animation variant
          initial="hidden"
          animate="visible"
        >
          {/* Add a hover effect for visual feedback */}
          <motion.div
            className="fins-logo-group"
            whileHover={{
              scale: 1.05,
              filter: "drop-shadow(0 5px 18px rgba(125, 174, 255, 0.4))",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="fins-logo-text">
              <h1 className="text-white">FINS</h1>
              <p className="text-white">Fish index Search Engine</p>{" "}
            </div>
            <img src={logoImage} alt="Fish logo" className="fins-logo-img" />
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          className="fins-main"
          variants={containerVariants} // Container variant to orchestrate children
          initial="hidden"
          animate="visible"
        >
          <div className="fins-grid">
            {/* Left Column - Text Content */}
            <div className="fins-text-content">
              {/* Main Headline */}
              <motion.h2
                className="fins-headline text-ocean-headline"
                variants={textItemVariants} // Apply item animation variant
              >
                Discover <br /> the
                <br />
                Ocean's Beauty
              </motion.h2>

              {/* Description */}
              <motion.p
                className="fins-description text-ocean-text"
                variants={textItemVariants} // Apply item animation variant
              >
                Explore thousands of fish species with our comprehensive
                database. Search by name, habitat, or characteristics.
              </motion.p>

              {/* CTA Button - Use whileHover/whileTap for interactive feel */}
              <motion.button
                className="fins-cta-button bg-ocean-button shadow-button-inset"
                onClick={onCtaClick}
                variants={textItemVariants} // Apply item animation variant
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 0 25px rgba(125, 174, 255, 0.6), 0 0 50px rgba(125, 174, 255, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="text-ocean-button-text ">Try diving in</span>
              </motion.button>
            </div>

            {/* Right Column - Fish Image (Desktop) */}
            <motion.div
              className="fins-desktop-fish"
              variants={fishVariants} // Apply fish animation variant
              initial="hidden"
              animate="visible"
              // The continuous float animation is kept in CSS for performance
            >
              <motion.img
                src={desktopFish}
                alt="Colorful betta fish"
                className=""
              />
            </motion.div>
          </div>

          {/* Bottom Preview Image (REMOVED) */}
        </motion.main>
      </div>
    </div>
  );
}
