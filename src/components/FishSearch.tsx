import React, { useState, useEffect } from "react";
import "./FishSearch.css";
import AdvancedSearchForm from "./AdvancedSearch";
import FishResultCard from "./FishResultCard";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WavesIcon from "@mui/icons-material/Waves";

import ErrorImage from "../assets/404image.png";

// ============================================
// CORS PROXY HELPER
// ============================================
const buildApiUrl = (endpoint: string): string => {
  const baseUrl = "https://demos.isl.ics.forth.gr/semantyfish-api/resources";
  const fullUrl = `${baseUrl}${endpoint}`;
  // Using a CORS proxy
  return `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
};

// --- INTERFACES ---
export interface FishData {
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
  genus_details: any;
  family_details: any;
  order_details: any;
  class_details: any;
  common_names_list: { common_name: string; language: string }[];
  photo_url?: string;
}

interface SpeciesSummary {
  id: number;
  scientific_name: string;
  common_name: string;
}

interface RandomFishSummary {
  id: number;
  scientific_name: string;
  common_name: string;
  photo_url: string;
  class: string;
  order: string;
  family: string;
  max_depth: string;
  environment: string;
  description: string;
}

const LIMIT_RESULTS = 10;

export default function FishSearch({
  onFishFound,
}: {
  onFishFound?: (fish: FishData) => void;
}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [randomFishList, setRandomFishList] = useState<RandomFishSummary[]>([]);
  const [isRandomLoading, setIsRandomLoading] = useState(true);
  const [searchResultsList, setSearchResultsList] = useState<SpeciesSummary[]>(
    [],
  );

  const capitalizeFirstLetter = (string: string): string => {
    if (!string) return "";
    const parts = string.trim().split(" ");
    if (parts.length > 1) {
      return (
        parts[0].charAt(0).toUpperCase() +
        parts[0].slice(1).toLowerCase() +
        " " +
        parts.slice(1).join(" ").toLowerCase()
      );
    }
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const getDimensionValue = (dimensions: any[], type: string): string => {
    const dim = dimensions.find((d: any) => d.type === type);
    if (dim && dim.value) {
      const unit = dim.unit || "";
      if (type === "max weight" && unit === "kilograms") {
        return `${dim.value.toLocaleString("en-US", {
          maximumFractionDigits: 1,
        })} kg`;
      }
      return `${dim.value} ${unit}`;
    }
    return "N/A";
  };

  const fetchAndParse = async (url: string | null): Promise<any> => {
    if (url === null) return {};
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      return {};
    } catch (e) {
      console.error(`Error fetching data from ${url}:`, e);
    }
    return {};
  };

  const fetchSpeciesDetails = async (
    speciesCode: number,
    commonName: string = "N/A",
  ) => {
    const detailsResponse = await fetch(buildApiUrl(`/species/${speciesCode}`));

    if (!detailsResponse.ok) {
      throw new Error(
        `Αποτυχία λήψης στοιχείων είδους για ID ${speciesCode}. Status: ${detailsResponse.status}`,
      );
    }

    const data = await detailsResponse.json();
    const dims = data.dimensions || [];

    const genusCode = data.genus?.genus_code;
    const familyCode = data.family?.family_code;

    const [genusData, familyData, commonNamesDataRaw] = await Promise.all([
      fetchAndParse(genusCode ? buildApiUrl(`/genus/${genusCode}`) : null),
      fetchAndParse(familyCode ? buildApiUrl(`/family/${familyCode}`) : null),
      fetchAndParse(
        buildApiUrl(`/get_common_names_for?species_code=${speciesCode}`),
      ),
    ]);

    const orderCode = familyData.order?.order_code;
    const classCode = familyData.class?.class_code;

    const [orderData, classData] = await Promise.all([
      fetchAndParse(orderCode ? buildApiUrl(`/order/${orderCode}`) : null),
      fetchAndParse(classCode ? buildApiUrl(`/class/${classCode}`) : null),
    ]);

    const photoUrl = `https://www.fishbase.de/images/species/${data.species_code}.gif`;

    const fishInfo: FishData = {
      id: data.id || speciesCode,
      species_code: speciesCode,
      scientific_name: data.scientific_name || "N/A",
      common_name:
        data.vernacular_name || data.common_name || commonName || "N/A",
      vernacular_name:
        data.vernacular_name || data.common_name || commonName || "N/A",
      scientific_author: data.scientific_name_assignment
        ? `${data.scientific_name_assignment.assigned_by} (${data.scientific_name_assignment.at_year})`
        : "N/A",
      genus: data.genus?.genus_name || "N/A",
      genus_code: data.genus?.genus_code || 0,
      family: data.family?.family_name || "N/A",
      family_code: data.family?.family_code || 0,
      subfamily: data.subfamily || "N/A",
      taxonomic_issue: data.taxonomic_issue?.issue || "None",
      taxonomic_remarks: data.taxonomic_issue?.remarks || "N/A",
      source: data.source || "N/A",
      saltwater: data.salt_water_environment || false,
      freshwater: data.freshwater_environment || false,
      brackish: data.brackish_water_environment || false,
      preferred_environment: data.preferred_environment || "N/A",
      body_shape: data.body_shape || "N/A",
      dangerous_species: data.dangerous_species_indicator || "N/A",
      electrogenic: data.electrogenic || "N/A",
      air_breathing: data.air_breathing_status || "N/A",
      migration_type: data.migration_type || "N/A",
      size_of_fish: getDimensionValue(dims, "max length"),
      min_depth: getDimensionValue(dims, "most shallow waters"),
      max_depth: getDimensionValue(dims, "most deep waters"),
      common_shallow: getDimensionValue(dims, "common shallow waters"),
      common_deep: getDimensionValue(dims, "common deep waters"),
      max_weight: getDimensionValue(dims, "max weight"),
      max_age: getDimensionValue(dims, "longevity wild"),
      fishing_vulnerability: data.vulnerability_fishing?.index || "N/A",
      fishing_vulnerability_value: data.vulnerability_fishing?.value || 0,
      vulnerability_climate_index: data.vulnerability_climate?.index || "N/A",
      vulnerability_climate_value: data.vulnerability_climate?.value || 0,
      phylogenetic_diversity: data.phylogenetic_diversity_index || 0,
      emblematic_species: data.emblematic_species || false,
      fisheries_importance: data.importance?.importance || "N/A",
      importance_remarks: data.importance?.remarks || "N/A",
      used_as_bait: data.used_as_bait || "N/A",
      aquaculture_status: data.used_for_aquaculture || "N/A",
      game_fish: data.world_record_game_fishes || false,
      catching_methods:
        data.catching_method?.main_method_using_fao_name || "N/A",
      other_catching_methods: data.catching_method?.other_methods || [],
      landings_statistics: data.landings?.statistics || "N/A",
      landings_areas: data.landings?.areas || "N/A",
      price_category: data.price_category?.value || "N/A",
      price_reliability: data.price_category?.price_reliability || "N/A",
      aquarium_demand: data.aquarium_demand?.value || "N/A",
      aquarium_details: data.aquarium_demand?.details || "N/A",
      description: data.comments || "No description available.",
      comments: data.comments || "No description available.",
      genus_details: genusData,
      family_details: familyData,
      order_details: orderData,
      class_details: classData,
      common_names_list: commonNamesDataRaw.common_names || [],
      photo_url: photoUrl,
    };

    console.log("Complete Fish Data:", fishInfo);
    if (onFishFound) onFishFound(fishInfo);
  };

  const advancedSearchDatabase = async (filters: Record<string, string>) => {
    setRandomFishList([]);
    setSearchResultsList([]);
    setIsLoading(true);
    setError(null);
    setQuery("");

    const filteredFilters = Object.entries(filters)
      .filter(([, value]) => value !== "" && value !== "false")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = Object.entries(filteredFilters)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const finalQuery = queryString || "scientific_name=";
    const searchUrl = buildApiUrl(`/search_species?${finalQuery}`);

    try {
      console.log("Advanced search URL:", searchUrl);
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(`Server returned status ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      let resultsArray = searchData.results;

      if (resultsArray && resultsArray.length > LIMIT_RESULTS) {
        console.warn(`Limiting results to first ${LIMIT_RESULTS} for testing.`);
        resultsArray = resultsArray.slice(0, LIMIT_RESULTS);
      }

      if (!resultsArray || resultsArray.length === 0) {
        setError("Δεν βρέθηκαν αποτελέσματα για τα επιλεγμένα κριτήρια.");
        return;
      }

      if (resultsArray.length === 1) {
        await fetchSpeciesDetails(resultsArray[0], "N/A");
      } else {
        const nameFetchPromises = resultsArray.map((id: number) =>
          fetch(buildApiUrl(`/species/${id}`))
            .then((res) => res.json())
            .then((data) => ({
              id: id,
              scientific_name: data.scientific_name || "N/A",
              common_name: data.common_name || data.vernacular_name || "N/A",
            }))
            .catch((e) => {
              console.error(`Error fetching name for ID ${id}:`, e);
              return null;
            }),
        );

        const rawResults: (SpeciesSummary | null)[] =
          await Promise.all(nameFetchPromises);
        const validResults: SpeciesSummary[] = rawResults.filter(
          (r) => r !== null,
        ) as SpeciesSummary[];

        if (validResults.length > 0) {
          setSearchResultsList(validResults);
        } else {
          setError(
            "Η αναζήτηση βρήκε IDs, αλλά απέτυχε να φορτώσει τις λεπτομέρειες των ειδών.",
          );
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Προέκυψε άγνωστο σφάλμα κατά τη σύνθετη αναζήτηση.";
      console.error("Advanced search error:", err);
      setError(`Η σύνθετη αναζήτηση απέτυχε. Λεπτομέρειες: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const searchDatabase = async (searchQuery: string) => {
    setRandomFishList([]);
    setIsLoading(true);
    setError(null);
    setSearchResultsList([]);

    const query = searchQuery.trim();
    const numericId = parseInt(query);
    const isIdSearch = !isNaN(numericId) && numericId > 0;

    try {
      let speciesCodeToFetch = 0;
      let resultsArray: number[] = [];
      const capitalizedQuery = capitalizeFirstLetter(query);

      let searchData = null;

      let searchUrl = buildApiUrl(
        `/search_common_names?common_name=${encodeURIComponent(query)}`,
      );
      let searchResponse = await fetch(searchUrl);
      searchData = searchResponse.ok ? await searchResponse.json() : null;

      if (searchData && searchData.ids && searchData.ids.length > 0) {
        resultsArray = searchData.ids;
      }

      if (resultsArray.length === 0) {
        searchUrl = buildApiUrl(
          `/search_common_names?common_name=${encodeURIComponent(
            capitalizedQuery,
          )}`,
        );
        searchResponse = await fetch(searchUrl);
        searchData = searchResponse.ok ? await searchResponse.json() : null;

        if (searchData && searchData.ids && searchData.ids.length > 0) {
          resultsArray = searchData.ids;
        }
      }

      if (resultsArray.length === 0 && isIdSearch) {
        speciesCodeToFetch = numericId;
      }

      if (resultsArray.length === 0 && !isIdSearch) {
        // --- Search by Scientific Name ---
        searchUrl = buildApiUrl(
          `/search_species?scientific_name=${encodeURIComponent(
            capitalizedQuery,
          )}`,
        );
        searchResponse = await fetch(searchUrl);
        searchData = searchResponse.ok ? await searchResponse.json() : null;

        if (searchData && searchData.results && searchData.results.length > 0) {
          resultsArray = searchData.results;
        }

        if (resultsArray.length === 0) {
          // --- Search by Genus Name ---
          searchUrl = buildApiUrl(
            `/search_species?genus=${encodeURIComponent(capitalizedQuery)}`,
          );
          searchResponse = await fetch(searchUrl);
          searchData = searchResponse.ok ? await searchResponse.json() : null;

          if (
            searchData &&
            searchData.results &&
            searchData.results.length > 0
          ) {
            resultsArray = searchData.results;
          }
        }
      }

      if (resultsArray.length === 1) {
        speciesCodeToFetch = resultsArray[0];
      }

      if (resultsArray.length > 1) {
        const nameFetchPromises = resultsArray.map((id: number) =>
          fetch(buildApiUrl(`/species/${id}`))
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Invalid ID: ${id}. Status: ${res.status}`);
              }
              return res.json();
            })
            .then((data) => ({
              id: id,
              scientific_name: data.scientific_name || "N/A",
              common_name: data.common_name || data.vernacular_name || "N/A",
            }))
            .catch((e) => {
              console.error(`Error processing ID ${id}:`, e.message);
              return null;
            }),
        );

        const rawResults: (SpeciesSummary | null)[] =
          await Promise.all(nameFetchPromises);
        const validResults: SpeciesSummary[] = rawResults.filter(
          (r) => r !== null,
        ) as SpeciesSummary[];

        if (validResults.length === 0) {
          setError(
            `Η αναζήτηση βρήκε ακατάλληλα δεδομένα, δοκιμάστε πιο συγκεκριμένη αναζήτηση.`,
          );
          setIsLoading(false);
          return;
        }

        setSearchResultsList(validResults);
        setIsLoading(false);
        return;
      }

      if (speciesCodeToFetch > 0) {
        await fetchSpeciesDetails(
          speciesCodeToFetch,
          isIdSearch ? "N/A" : query,
        );
      } else {
        setError(
          `Δεν βρέθηκε είδος με το ID ή την ονομασία/γένος: "${query}".`,
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Προέκυψε άγνωστο σφάλμα κατά την αναζήτηση.";
      console.error("Search error:", err);
      setError(`Η αναζήτηση απέτυχε. Λεπτομέρειες: ${errorMessage}`);
    }

    setIsLoading(false);
  };

  const handleSearch = () => {
    if (query.trim()) {
      searchDatabase(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch();
    }
  };

  const fetchRandomFishData = async () => {
    setIsRandomLoading(true);

    const featuredFishMapping = [
      { id: 1051, placeholder: "Clown Anemonefish" },
      { id: 143, placeholder: "Yellowfin Tuna" },
      { id: 4082, placeholder: "Oceanic Whitetip Shark" },
      { id: 137, placeholder: "Reef Fish" },
      { id: 5849, placeholder: "Grouper" },
      { id: 137, placeholder: "Mackerel" },
      { id: 1051, placeholder: "Angelfish" },
      { id: 143, placeholder: "Tiger Shark" },
    ];

    const fetchPromises = featuredFishMapping.map(async (item) => {
      try {
        const detailResponse = await fetch(buildApiUrl(`/species/${item.id}`));
        if (!detailResponse.ok) throw new Error("Species fetch failed");
        const data = await detailResponse.json();
        const dims = data.dimensions || [];

        const familyData = await fetchAndParse(
          data.family?.family_code
            ? buildApiUrl(`/family/${data.family.family_code}`)
            : null,
        );
        const classData = await fetchAndParse(
          familyData.class?.class_code
            ? buildApiUrl(`/class/${familyData.class.class_code}`)
            : null,
        );
        const orderData = await fetchAndParse(
          familyData.order?.order_code
            ? buildApiUrl(`/order/${familyData.order.order_code}`)
            : null,
        );

        const commonName =
          data.common_name || data.vernacular_name || item.placeholder;

        const photoUrl = `https://www.fishbase.de/images/species/${data.species_code}.gif`;

        const primaryDescription = data.comments || data.description;

        const descriptionText =
          primaryDescription ||
          `No detailed description available for ${commonName}.`;

        return {
          id: item.id,
          scientific_name: data.scientific_name || "N/A",
          common_name: commonName,
          photo_url: photoUrl,
          class: classData.name || "N/A",
          order: orderData.name || "N/A",
          family: data.family?.family_name || "N/A",
          max_depth: getDimensionValue(dims, "most deep waters"),
          environment: data.preferred_environment || "N/A",
          description: descriptionText,
        };
      } catch (e) {
        console.error(`Failed to fetch featured fish for ID ${item.id}:`, e);
        return null;
      }
    });

    const results = (await Promise.all(fetchPromises)).filter(
      (r): r is RandomFishSummary => r !== null,
    ) as RandomFishSummary[];
    setRandomFishList(results);
    setIsRandomLoading(false);
  };

  useEffect(() => {
    fetchRandomFishData();
  }, []);

  const FeaturedFishCard = ({ fish }: { fish: RandomFishSummary }) => (
    <div
      onClick={() => {
        setIsLoading(true);
        fetchSpeciesDetails(fish.id, fish.common_name);
      }}
      style={{ cursor: "pointer" }}
    >
      <FishResultCard
        commonName={fish.common_name}
        scientificName={fish.scientific_name}
        typeLabel={fish.common_name.split(" ")[0] || fish.family}
        taxonomy={{
          class: fish.class,
          order: fish.order,
          family: fish.family,
        }}
        habitatInfo={{
          maxDepth: fish.max_depth,
          environment: fish.environment,
        }}
        imageUrl={fish.photo_url}
        statusLabel={
          fish.class.includes("Osteichthyes") ? "Stable" : "Vulnerable"
        }
        rarityLabel={fish.family.includes("idae") ? "Common" : "Rare"}
        population={fish.order || "N/A"}
        region={fish.environment || "N/A"}
        description={fish.description}
        onClick={() => {
          setIsLoading(true);
          fetchSpeciesDetails(fish.id, fish.common_name);
        }}
      />
    </div>
  );

  const handleGoBackToSearch = () => {
    setError(null);
    setQuery("");
    setSearchResultsList([]);
    if (randomFishList.length === 0) {
      fetchRandomFishData();
    }
  };

  return (
    <div className="ocean-bg">
      <header className="fins-header header-no-search">
        <div className="fins-logo-group">
          <div className="fins-title-container">
            <h1 className="fins-title">FINS</h1>
            <p className="fins-subtitle">Fish INformation System</p>
          </div>

          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/0926101c9de7b3c1c18e2604ce8f7ffd2ef493e7?width=222"
            alt="FINS Logo"
            className="fins-logo-img"
          />
        </div>

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

      {error ? (
        <Box
          sx={{
            minHeight: "calc(100vh - 100px)",
            width: "100%",
            position: "relative",
            overflow: "hidden",
            backgroundImage: `url(${ErrorImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark overlay for readability */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 1,
            }}
          />

          <Box
            sx={{
              maxWidth: 900,
              position: "absolute",
              top: { xs: "100px", md: "20px" },
              right: { xs: "20px", md: "50px" },
              textAlign: "center",
              zIndex: 2,
              p: 3,
            }}
          >
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  borderRadius: 4,
                  boxShadow: 8,
                  width: "100%",
                  backgroundColor: "#dc262698",
                  color: "white",
                  fontSize: "1.2rem",
                  "& .MuiAlert-message": { fontWeight: 700, color: "white" },
                  "& .MuiAlert-icon": { fontSize: 30, color: "white" },
                }}
              >
                {error}
              </Alert>
            </Fade>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: "100px",
              left: "50%",
              transform: "translateX(-50%)", // Pull back 50% of its own width to center
              zIndex: 2,
            }}
          >
            <Button
              onClick={handleGoBackToSearch}
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                mt: 3,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1.05rem",
                background: "linear-gradient(90deg, #00bcd4 0%, #009688 100%)",
                color: "white",
                boxShadow: "0 6px 25px rgba(0, 188, 212, 0.8)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #009688 0%, #00bcd4 100%)",
                  boxShadow: "0 8px 30px rgba(0, 188, 212, 1)",
                },
              }}
            >
              Return to Search Page
            </Button>
          </Box>
        </Box>
      ) : (
        // === NORMAL SEARCH PAGE VIEW ---
        <>
          {/* Hero Section (Ocean's Wonders, Search Bar) */}
          <Box className="hero-search-wrapper">
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.5rem", sm: "2.5rem" },
                color: "#ffffff",
                letterSpacing: "-1px",
                mb: 0,
              }}
            >
              Explore the
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.5rem", sm: "2.5rem" },
                background:
                  "linear-gradient(90deg, #194956 0%, #194956 11.1%, #2AB4C3 44.4%, #3BC1F2 70%,#55ADF8 50%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
                mb: 2,
              }}
            >
              Ocean's Wonders
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#c8d2e8",
                maxWidth: 800,
                mx: "auto",
                mb: 4,
                fontSize: { xs: "2rem", sm: "1rem" },
                fontWeight: 400,
              }}
            >
              Discover comprehensive data on marine life, population dynamics,
              and conservation status of aquatic species worldwide.
            </Typography>

            <Box className="centered-search-container">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search ID, Scientific Name, Genus"
                className="search-input centered-search-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSearch}
                className="search-button centered-search-button"
                disabled={isLoading}
              >
                <SearchIcon sx={{ fontSize: 32, color: "white" }} />
              </button>
            </Box>
          </Box>
          <Box
            sx={{
              py: 4,
              px: { xs: 2, sm: 4, md: 8 },
            }}
          >
            {searchResultsList.length === 0 && !error && (
              <Fade in timeout={800}>
                <Box>
                  <Box sx={{ maxWidth: "1500px", mx: "auto", mb: 4 }}>
                    <AdvancedSearchForm
                      onSearch={advancedSearchDatabase}
                      onSearchStart={() => {
                        setIsLoading(true);
                        setSearchResultsList([]);
                      }}
                      onError={setError}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      my: 5,
                      "&::before, &::after": {
                        content: '""',
                        flex: 1,
                        borderBottom: "2px dashed",
                        borderColor: "divider",
                      },
                    }}
                  >
                    <WavesIcon sx={{ color: "#00bcd4", fontSize: 32 }} />
                  </Box>

                  <Box
                    sx={{
                      mb: 4,
                      pl: { xs: 0, sm: 15 },
                      pr: { xs: 0, sm: 15 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 3,
                        px: 0,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 5,
                            height: 30,
                            bgcolor: "#288590ff",
                            borderRadius: 1,
                            ml: 0,
                          }}
                        />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            color: "#ffffff",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Featured Species
                        </Typography>
                        <Chip
                          label={`${randomFishList.length} Species`}
                          size="small"
                          sx={{
                            bgcolor: "#2AB4C3",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{
                          color: "#b7bbc4ff",
                          fontSize: "1.1rem",
                          ml: 1,
                        }}
                      >
                        Dive into detailed profiles of remarkable aquatic
                        creatures
                      </Typography>
                    </Box>
                    {isRandomLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 8,
                          gap: 2,
                        }}
                      >
                        <CircularProgress size={48} sx={{ color: "#00bcd4" }} />
                        <Typography
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          Loading featured fish...
                        </Typography>
                      </Box>
                    ) : (
                      <Grid
                        container
                        spacing={3}
                        sx={{
                          maxWidth: "100%",
                          mx: 0,
                          width: "100%",
                        }}
                      >
                        {randomFishList.map((fish, index) => {
                          const currentStatus = fish.class.includes(
                            "Osteichthyes",
                          )
                            ? "Stable"
                            : "Vulnerable";
                          const currentRarity = fish.family.includes("idae")
                            ? "Common"
                            : "Rare";

                          const currentOrder = fish.order || "N/A";
                          const currentEnvironment = fish.environment || "N/A";

                          return (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={3}
                              lg={3}
                              xl={3}
                              key={`${fish.id}-${index}`}
                              sx={{
                                display: "flex",
                                minWidth: 0,
                              }}
                            >
                              <Fade in timeout={300 + index * 100}>
                                <Box sx={{ width: "100%", height: "100%" }}>
                                  <FishResultCard
                                    commonName={fish.common_name}
                                    scientificName={fish.scientific_name}
                                    typeLabel={
                                      fish.common_name.split(" ")[0] ||
                                      fish.family
                                    }
                                    taxonomy={{
                                      class: fish.class,
                                      order: fish.order,
                                      family: fish.family,
                                    }}
                                    habitatInfo={{
                                      maxDepth: fish.max_depth,
                                      environment: fish.environment,
                                    }}
                                    imageUrl={fish.photo_url}
                                    statusLabel={currentStatus}
                                    rarityLabel={currentRarity}
                                    population={currentOrder}
                                    region={currentEnvironment}
                                    description={fish.description}
                                    onClick={() => {
                                      setIsLoading(true);
                                      fetchSpeciesDetails(
                                        fish.id,
                                        fish.common_name,
                                      );
                                    }}
                                  />
                                </Box>
                              </Fade>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </Box>
                </Box>
              </Fade>
            )}
            {searchResultsList.length > 0 && (
              <Fade in timeout={500}>
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#004d40",
                        mb: 1,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Πολλαπλά Αποτελέσματα Βρέθηκαν
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Παρακαλώ επιλέξτε το είδος που θέλετε να δείτε αναλυτικά:
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {searchResultsList.map((result, index) => (
                        <Fade in timeout={200 + index * 50} key={result.id}>
                          <Box
                            onClick={() => {
                              setQuery(result.id.toString());
                              setIsLoading(true);
                              fetchSpeciesDetails(
                                result.id,
                                result.common_name,
                              );
                            }}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              bgcolor: "white",
                              boxShadow: 2,
                              cursor: "pointer",
                              transition: "all 0.3s",
                              borderLeft: "4px solid #00bcd4",
                              justifyContent: "space-between",
                              alignItems: "center",
                              "&:hover": {
                                boxShadow: 6,
                                transform: "translateX(8px)",
                                borderLeftColor: "#004d40",
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#004d40" }}
                              >
                                {result.common_name || "N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                {result.scientific_name || "N/A"}
                              </Typography>
                            </Box>
                            <SearchIcon sx={{ color: "#00bcd4" }} />
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}
            <Box sx={{ minHeight: "150px", mt: 3 }}>
              {isLoading && (
                <Fade in>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 6,
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={56} sx={{ color: "#00bcd4" }} />
                    <Typography
                      variant="h6"
                      sx={{ color: "#004d40", fontWeight: 600 }}
                    >
                      🌊 Λήψη πλήρων δεδομένων από το FishBase...
                    </Typography>
                  </Box>
                </Fade>
              )}

              {/* Note: The main error display is now handled by the conditional block above */}
            </Box>
          </Box>
        </>
      )}
    </div>
  );
}
