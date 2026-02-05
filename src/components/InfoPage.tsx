import React, { useState, useRef } from "react";
import "./InfoPage.css";
import staticMapImageUrl from "../assets/map.jpg";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";

interface FishData {
  id: number;
  species_code: number;
  scientific_name: string;
  common_name: string;
  vernacular_name: string;
  scientific_author: string;
  genus: string;
  genus_code: number;
  family: string;
  family_code: number;
  subfamily: string;
  taxonomic_issue: string;
  taxonomic_remarks: string;
  source: string;
  saltwater: boolean;
  freshwater: boolean;
  brackish: boolean;
  preferred_environment: string;
  body_shape: string;
  dangerous_species: string;
  electrogenic: string;
  air_breathing: string;
  migration_type: string;
  size_of_fish: string;
  min_depth: string;
  max_depth: string;
  common_shallow: string;
  common_deep: string;
  max_weight: string;
  max_age: string;
  fishing_vulnerability: string;
  fishing_vulnerability_value: number;
  vulnerability_climate_index: string;
  vulnerability_climate_value: number;
  phylogenetic_diversity: number;
  emblematic_species: boolean;
  fisheries_importance: string;
  importance_remarks: string;
  used_as_bait: string;
  aquaculture_status: string;
  game_fish: boolean;
  catching_methods: string;
  other_catching_methods: string[];
  landings_statistics: string;
  landings_areas: string;
  price_category: string;
  price_reliability: string;
  aquarium_demand: string;
  aquarium_details: string;
  description: string;
  comments: string;

  genus_details: { diagnosis?: string; etymology?: string };
  family_details: {
    etymology?: string;
    species_count?: number;
    number_of_valid_species?: number;
    order_name?: string;
  };
  order_details: { name?: string; order_name?: string };
  class_details: any;
  // ** UPDATED LIST TYPE **
  common_names_list: { common_name: string; language: string }[];

  photo_url?: string;
}

interface CommonNameItem {
  common_name: string;
  language: string;
}

const getLanguageEmoji = (language: string): string => {
  switch (language.toLowerCase()) {
    case "greek":
      return "🇬🇷";
    case "english":
      return "🇬🇧";
    case "spanish":
      return "🇪🇸";
    case "french":
      return "🇫🇷";
    case "portuguese":
      return "🇵🇹";
    case "german":
      return "🇩🇪";
    case "mandarin chinese":
    case "chinese":
      return "🇨🇳";
    case "japanese":
      return "🇯🇵";
    case "italian":
      return "🇮🇹";
    case "russian":
      return "🇷🇺";
    case "turkish":
      return "🇹🇷";
    case "dutch":
      return "🇳🇱";
    default:
      return "🌐";
  }
};

const CommonNamesTable: React.FC<{ names: CommonNameItem[] }> = ({ names }) => {
  if (!names || names.length === 0) {
    return (
      <div
        className="full-width common-names-table-container"
        style={{ border: "none", boxShadow: "none" }}
      >
        <p
          className="common-names-label"
          style={{ color: "var(--text-medium)" }}
        >
          Δεν υπάρχουν καταχωρημένες κοινές ονομασίες για αυτό το είδος.
        </p>
      </div>
    );
  }

  // Group names by language
  const groupedNames = names.reduce(
    (acc, item) => {
      const lang = item.language || "Άγνωστη Γλώσσα";
      if (!acc[lang]) {
        acc[lang] = [];
      }
      acc[lang].push(item.common_name);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const displayData = Object.entries(groupedNames).map(
    ([language, commonNames]) => ({
      language,
      names: commonNames.join("; "),
    }),
  );

  return (
    <div className="full-width common-names-table-container">
      <h4>Common Names in Various Languages</h4>
      <Paper
        elevation={3}
        sx={{
          bgcolor: "var(--light-bg)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: 350 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0, 188, 212, 0.1)" }}>
                <TableCell
                  sx={{
                    color: "var(--primary-blue)",
                    fontWeight: 700,
                    width: "25%",
                  }}
                >
                  Language
                </TableCell>
                <TableCell
                  sx={{ color: "var(--primary-blue)", fontWeight: 700 }}
                >
                  Common Name(s)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "var(--card-bg)" },
                    "&:nth-of-type(even)": {
                      backgroundColor: "var(--light-bg)",
                    },
                  }}
                >
                  <TableCell className="language-flag">
                    <span role="img" aria-label={row.language}>
                      {getLanguageEmoji(row.language)}
                    </span>
                    {row.language}
                  </TableCell>
                  <TableCell className="common-name-value">
                    {row.names}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

const getVulnColor = (value: number): string => {
  if (value > 70) return "#dc2626"; // High (Red)
  if (value > 40) return "#f59e0b"; // Moderate (Orange)
  return "#10b981"; // Low (Green)
};

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="info-card">
    <h4>{title}</h4>
    {children}
  </div>
);

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="data-row">
    <span className="data-row-label">{label}:</span>
    <strong className="data-row-value">{value}</strong>
  </div>
);

const EnvTag = ({ active, label }: { active: boolean; label: string }) => (
  <span className={`env-tag ${active ? "env-tag-active" : "env-tag-inactive"}`}>
    {label}
  </span>
);

const VulnerabilityBar = ({
  label,
  value,
  index,
  color,
}: {
  label: string;
  value: number;
  index: string;
  color: string;
}) => (
  <div className="vulnerability-bar-wrapper">
    <div className="vulnerability-bar-header">
      <span className="vulnerability-label">{label}:</span>
      <div className="vulnerability-bar-track">
        <div
          className="vulnerability-bar-fill"
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
      <span className="vulnerability-value" style={{ color: color }}>
        {value}
      </span>
    </div>
    <p className="vulnerability-index">{index}</p>
  </div>
);

const SidebarCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="sidebar-card">
    <h3>{title}</h3>
    {children}
  </div>
);

// --- InfoPage Component ---

export default function InfoPage({
  fish,
  onGoBack,
}: {
  fish?: FishData;
  onGoBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("classification");

  const descriptionRef = useRef<HTMLDivElement>(null);

  const scrollToDescription = () => {
    setActiveTab("description");
    requestAnimationFrame(() => {
      if (descriptionRef.current) {
        descriptionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  };

  const defaultFish: FishData = {
    // ... (defaultFish structure)
    id: 143,
    species_code: 143,
    scientific_name: "Thunnus albacares",
    common_name: "Yellowfin tuna",
    vernacular_name: "Yellowfin tuna",
    scientific_author: "Bonnaterre (1788)",
    genus: "Thunnus",
    genus_code: 8961,
    family: "Scombridae",
    family_code: 416,
    subfamily: "Scombrinae",
    taxonomic_issue: "Valid in CofF",
    taxonomic_remarks: "N/A",
    source: "last revision",
    saltwater: true,
    freshwater: false,
    brackish: true,
    preferred_environment: "pelagic-oceanic",
    body_shape: "fusiform / normal",
    dangerous_species: "harmless",
    electrogenic: "no special ability",
    air_breathing: "WaterAssumed",
    migration_type: "oceanodromous",
    size_of_fish: "239 cm",
    min_depth: "1 meters",
    max_depth: "1602 meters",
    common_shallow: "1 meters",
    common_deep: "250 meters",
    max_weight: "200.0 kg",
    max_age: "9 years",
    fishing_vulnerability: "moderate to high",
    fishing_vulnerability_value: 45.6,
    vulnerability_climate_index: "moderate",
    vulnerability_climate_value: 41.67,
    phylogenetic_diversity: 0.5039,
    emblematic_species: false,
    fisheries_importance: "highly commercial",
    importance_remarks: "N/A",
    used_as_bait: "never/rarely",
    aquaculture_status: "experimental",
    game_fish: true,
    catching_methods: "purse seines (PS)",
    other_catching_methods: [
      "gillnets",
      "traps",
      "hook and line",
      "trawling",
      "longlines",
      "jigging",
    ],
    landings_statistics: "more than 500,000",
    landings_areas: "1011764 t in 1990; By Mexico,USA(77), Japan(7)",
    price_category: "high",
    price_reliability: "Reliable",
    aquarium_demand: "never/rarely",
    aquarium_details: "N/A",
    description:
      "An oceanic species occurring above and below the thermoclines.",
    comments: "An oceanic species occurring above and below the thermoclines.",

    genus_details: {
      diagnosis: "Body covered with very small scales...",
      etymology: "Greek, thynnos=tunna",
    },
    family_details: {
      etymology: "Latin, scomber=mackerel",
      number_of_valid_species: 54,
    },
    order_details: { name: "Scombriformes" }, // Updated default key
    class_details: { name: "Teleostei" }, // Added default for class
    common_names_list: [],
    photo_url: "https://placehold.co/320x280/1a568b/ffffff?text=Yellowfin+Tuna",
  };

  const fishData = fish || defaultFish;

  const renderTabContent = () => {
    const tabContentRef = activeTab === "description" ? descriptionRef : null;

    switch (activeTab) {
      case "classification":
        const genusDetails = fishData.genus_details || {};
        const familyDetails = fishData.family_details || {};
        const orderDetails = fishData.order_details || {};
        const classDetails = fishData.class_details || {}; // Access Class Details

        return (
          <div className="info-grid">
            <InfoCard title="Taxonomic Identity">
              <DataRow
                label="Scientific Name"
                value={fishData.scientific_name}
              />
              <DataRow label="Authority" value={fishData.scientific_author} />
              <DataRow label="Common Name" value={fishData.common_name} />
              <DataRow
                label="Vernacular Name"
                value={fishData.vernacular_name}
              />
              <DataRow
                label="Family"
                value={`${fishData.family} (${fishData.family_code})`}
              />
              <DataRow label="Subfamily" value={fishData.subfamily} />
              <DataRow
                label="Genus"
                value={`${fishData.genus} (${fishData.genus_code})`}
              />
              <DataRow
                label="Species Code"
                value={fishData.species_code.toString()}
              />
            </InfoCard>

            <InfoCard title="Extended Taxonomic Details">
              <DataRow label="Order" value={orderDetails.name || "N/A"} />

              <DataRow label="Class" value={classDetails.name || "N/A"} />

              <DataRow
                label="Total Species in Family"
                value={
                  familyDetails.number_of_valid_species
                    ? familyDetails.number_of_valid_species.toString()
                    : "N/A"
                }
              />
              <DataRow
                label="Family Etymology"
                value={familyDetails.etymology || "N/A"}
              />
              <DataRow
                label="Genus Etymology"
                value={genusDetails.etymology || "N/A"}
              />
              <DataRow
                label="Genus Diagnosis"
                value={
                  genusDetails.diagnosis
                    ? genusDetails.diagnosis.substring(0, 50) + "..."
                    : "N/A"
                }
              />
            </InfoCard>

            <div className="full-width">
              <CommonNamesTable names={fishData.common_names_list} />
            </div>

            <InfoCard title="Taxonomic Status">
              <DataRow label="Status" value={fishData.taxonomic_issue} />
              <DataRow label="Remarks" value={fishData.taxonomic_remarks} />
              <DataRow label="Source" value={fishData.source} />
              <DataRow
                label="Emblematic Species"
                value={fishData.emblematic_species ? "Yes 🏆" : "No"}
              />
              <DataRow
                label="Game Fish"
                value={fishData.game_fish ? "Yes 🎣" : "No"}
              />
            </InfoCard>
          </div>
        );

      case "biology":
        return (
          <div className="info-grid">
            <InfoCard title="Physical Dimensions">
              <DataRow label="Max Length" value={fishData.size_of_fish} />
              <DataRow label="Max Weight" value={fishData.max_weight} />
              <DataRow label="Max Age" value={fishData.max_age} />
            </InfoCard>

            <InfoCard title="Physical Characteristics">
              <DataRow label="Body Shape" value={fishData.body_shape} />
              <DataRow label="Dangerous" value={fishData.dangerous_species} />
            </InfoCard>

            <InfoCard title="Physiological Features">
              <DataRow label="Air Breathing" value={fishData.air_breathing} />
              <DataRow label="Electrogenic" value={fishData.electrogenic} />
            </InfoCard>

            <div className="full-width">
              <InfoCard title="Environmental Tolerance">
                <div className="env-tags-container">
                  <EnvTag active={fishData.saltwater} label="🌊 Saltwater" />
                  <EnvTag active={fishData.freshwater} label="💧 Freshwater" />
                  <EnvTag active={fishData.brackish} label="🌿 Brackish" />
                </div>
                <DataRow
                  label="Preferred Environment"
                  value={fishData.preferred_environment}
                />
                <DataRow
                  label="Migration Type"
                  value={fishData.migration_type}
                />
              </InfoCard>
            </div>

            <div className="full-width">
              <InfoCard title="Depth Range">
                <DataRow label="Minimum Depth" value={fishData.min_depth} />
                <DataRow label="Maximum Depth" value={fishData.max_depth} />
                <DataRow
                  label="Common Shallow"
                  value={fishData.common_shallow}
                />
                <DataRow label="Common Deep" value={fishData.common_deep} />
              </InfoCard>
            </div>
          </div>
        );

      case "conservation":
        const fishingColor = getVulnColor(fishData.fishing_vulnerability_value);
        const climateColor = getVulnColor(fishData.vulnerability_climate_value);

        return (
          <div className="info-grid">
            <div className="full-width">
              <InfoCard title="Vulnerability Assessments">
                <VulnerabilityBar
                  label="Fishing Vulnerability"
                  value={fishData.fishing_vulnerability_value}
                  index={fishData.fishing_vulnerability}
                  color={fishingColor}
                />
                <VulnerabilityBar
                  label="Climate Vulnerability"
                  value={fishData.vulnerability_climate_value}
                  index={fishData.vulnerability_climate_index}
                  color={climateColor}
                />
                <DataRow
                  label="Phylogenetic Diversity"
                  value={fishData.phylogenetic_diversity.toString()}
                />
              </InfoCard>
            </div>
          </div>
        );

      case "commercial":
        return (
          <div className="info-grid">
            <InfoCard title="Fisheries Data">
              <DataRow
                label="Importance"
                value={fishData.fisheries_importance}
              />
              <DataRow label="Remarks" value={fishData.importance_remarks} />
              <DataRow label="Used as Bait" value={fishData.used_as_bait} />
              <DataRow
                label="Aquaculture Status"
                value={fishData.aquaculture_status}
              />
            </InfoCard>

            <InfoCard title="Catching Methods">
              <DataRow label="Main Method" value={fishData.catching_methods} />
              <div className="other-methods-list-wrapper">
                <span className="other-methods-label">Other Methods:</span>
                <ul className="other-methods-list">
                  {fishData.other_catching_methods.map((method, i) => (
                    <li key={i} className="method-pill">
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
            </InfoCard>

            <InfoCard title="Market Data">
              <DataRow label="Price Category" value={fishData.price_category} />
              <DataRow
                label="Price Reliability"
                value={fishData.price_reliability}
              />
            </InfoCard>

            <div className="full-width">
              <InfoCard title="Landings Information">
                <DataRow
                  label="Statistics"
                  value={fishData.landings_statistics}
                />
                <DataRow label="Areas" value={fishData.landings_areas} />
              </InfoCard>
            </div>

            <InfoCard title="Aquarium Trade">
              <DataRow label="Demand" value={fishData.aquarium_demand} />
              <DataRow label="Details" value={fishData.aquarium_details} />
            </InfoCard>
          </div>
        );

      case "description":
        return (
          <div className="full-width" ref={tabContentRef}>
            <InfoCard title="Complete Description">
              <p className="comments-text">{fishData.comments}</p>
            </InfoCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="info-page-container">
      <button className="floating-back-btn" onClick={onGoBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="back-btn-svg"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <header className="fins-header">
        <div className="fins-logo-group">
          <div className="fins-title-container">
            <h1 className="fins-title">FINS</h1>
            <p className="fins-subtitle">Fish INformation System</p>
          </div>
          {/* FINS Logo Image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/0926101c9de7b3c1c18e2604ce8f7ffd2ef493e7?width=222"
            alt="FINS Logo"
            className="fins-logo-img"
          />
        </div>

        {/* Home Button*/}
        <a href="/" className="fins-home-btn-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="0"
            className="fins-home-btn-img"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
          </svg>
        </a>
      </header>

      <div className="main-content-grid">
        <div className="main-column">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-grid">
              <div className="image-container">
                <img
                  src={fishData.photo_url}
                  alt={`Photo for ${fishData.common_name} (Placeholder)`}
                  className="fish-photo-actual"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/320x280/1a568b/ffffff?text=${
                      fishData.common_name
                        ? fishData.common_name.replace(/ /g, "+")
                        : `ID+${fishData.species_code}`
                    }`;
                    target.onerror = null;
                  }}
                />
              </div>

              <div>
                <h1 className="fish-common-name">{fishData.common_name}</h1>
                <p className="fish-scientific-name styled-name">
                  {fishData.scientific_name}
                </p>
                <div
                  className="description-box"
                  onClick={scrollToDescription}
                  style={{ cursor: "pointer" }}
                >
                  <p className="description-text">
                    {fishData.description.substring(0, 200)}...
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--primary-blue)",
                        display: "block",
                        marginTop: "5px",
                      }}
                    ></span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-wrapper">
            <div className="tabs-header">
              {[
                "Classification",
                "Biology",
                "Conservation",
                "Commercial",
                "Description",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`tab-button ${
                    activeTab === tab.toLowerCase() ? "tab-active" : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div>{renderTabContent()}</div>
          </div>
        </div>

        <div className="sidebar-column">
          <SidebarCard title="Distribution Map">
            <img
              src={staticMapImageUrl}
              alt="Global Distribution Map"
              className="map-image-actual"
            />
            <p className="map-environment">{fishData.preferred_environment}</p>
          </SidebarCard>

          <SidebarCard title="Quick Facts">
            <div className="quick-facts-list">
              <p>• Species ID: {fishData.id}</p>
              <p>• Family: {fishData.family}</p>
              <p>• Max Size: {fishData.size_of_fish}</p>
              <p>• Max Weight: {fishData.max_weight}</p>
              <p>• Max Age: {fishData.max_age}</p>
            </div>
          </SidebarCard>
        </div>
      </div>
    </div>
  );
}
