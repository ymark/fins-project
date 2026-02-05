import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LandingPage.css";
import backgroundImage from "../assets/dark.jpg";
import desktopFish from "../assets/Group 1.png";
import logoImage from "../assets/logo.png";
import tutorialVideo from "../assets/FINS-tutorial2.mp4";

interface LandingPageProps {
  onCtaClick: () => void;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
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

export default function LandingPage({ onCtaClick }: LandingPageProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="fins-container">
      {/* Background Image */}
      <div className="fins-bg-container">
        <img src={backgroundImage} alt="Ocean background" />
      </div>

      {/* Overlay */}
      <div className="fins-overlay bg-ocean-overlay" />

      {/* Content Container */}
      <div className="fins-content">
        {/* Header / Logo */}
        <header className="fins-header">
          <motion.div
            className="fins-logo-group"
            whileHover={{ scale: 1.02 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="fins-logo-text">
              <h1 className="text-white small-header">FINS</h1>
              <p className="text-white small-subheader">
                Fish INformation System
              </p>
            </div>
            <img src={logoImage} alt="Fish logo" className="fins-logo-img" />
          </motion.div>
        </header>

        {/* Main Content */}
        <motion.main
          className="fins-main"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="fins-grid">
            {/* Left Column - Text Content */}
            <div className="fins-text-content">
              <motion.h2
                className="fins-headline text-ocean-headline small-headline"
                variants={textItemVariants}
              >
                Discover <br /> the Ocean's Beauty
              </motion.h2>

              <motion.p
                className="fins-description text-ocean-text small-desc"
                variants={textItemVariants}
              >
                Explore thousands of fish species with our comprehensive
                database. Search by name, habitat, or characteristics.
              </motion.p>

              {/* Actions Wrapper: Button & Large Video Preview */}
              <div className="fins-actions-wrapper">
                <motion.button
                  className="fins-cta-button bg-ocean-button shadow-button-inset"
                  onClick={onCtaClick}
                  variants={textItemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-ocean-button-text">Try diving in</span>
                </motion.button>

                {/* Larger Autoplay Video Container */}
                <motion.div
                  className="tutorial-preview-container-large"
                  variants={textItemVariants}
                  onClick={() => setIsVideoOpen(true)}
                  whileHover={{ scale: 1.02 }}
                >
                  <video
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="preview-video-element"
                  >
                    <source src={tutorialVideo} type="video/quicktime" />
                    <source src={tutorialVideo} type="video/mp4" />
                  </video>
                  <div className="video-hover-hint">Click to enlarge</div>
                </motion.div>
              </div>
            </div>

            {/* Right Column - Fish Image */}
            <div className="fins-desktop-fish">
              <img src={desktopFish} alt="Fish" />
            </div>
          </div>
        </motion.main>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            className="video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              className="video-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-video"
                onClick={() => setIsVideoOpen(false)}
              >
                &times;
              </button>
              <video controls autoPlay className="full-video-element">
                <source src={tutorialVideo} type="video/quicktime" />
                <source src={tutorialVideo} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
