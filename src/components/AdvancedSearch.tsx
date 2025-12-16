import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Typography,
  Fade,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const buildApiUrl = (endpoint: string): string => {
  const baseUrl = "https://demos.isl.ics.forth.gr/semantyfish-api/resources";
  const fullUrl = `${baseUrl}${endpoint}`;
  return `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
};

interface TerminologyData {
  id: number;
  name: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: Record<string, string>) => void;
  onSearchStart: () => void;
  onError: (message: string | null) => void;
}

const AdvancedSearchForm: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSearchStart,
  onError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Attributes for species (uses /terminology_for_species)
  const allTermAttributes = [
    "body_shape",
    "catching_method",
    "electrogenic",
    "dangerous_species_indicator",
    "used_as_bait",
    "used_for_aquaculture",
    "migration_type",
    "air_breathing_status",
    "importance",
    "vulnerability_fishing",
  ];

  const commonNameTermAttributes = ["language"];

  const [terminologies, setTerminologies] = useState<
    Record<string, TerminologyData[]>
  >({});
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initialDynamic = [
      ...allTermAttributes,
      ...commonNameTermAttributes,
    ].reduce((acc, attr) => ({ ...acc, [attr]: "" }), {});
    const initialStatic = {
      salt_water_environment: "",
      freshwater_environment: "",
      brackish_water_environment: "",
    };
    return { ...initialDynamic, ...initialStatic };
  });

  const [isTerminologyLoading, setIsTerminologyLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchSpeciesTerminology = async (type: string) => {
    try {
      const url = buildApiUrl(`/terminology_for_species?attribute=${type}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const termList = data.results || [];

      return termList.map((name: string, index: number) => ({
        id: index + 1,
        name: name,
      }));
    } catch (e) {
      console.error(`Error fetching species terminology ${type}:`, e);
      return [];
    }
  };

  const fetchCommonNameTerminology = async (type: string) => {
    try {
      const url = buildApiUrl(
        `/terminology_for_common_names?attribute=language`
      );
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const termList = data.results || [];

      if (!Array.isArray(termList)) {
        console.error(
          `API response for ${type} is not a valid array in 'results'.`
        );
        return [];
      }

      return termList.map((name: string, index: number) => ({
        id: index + 1,
        name: name,
      }));
    } catch (e) {
      console.error(`Error fetching common name terminology ${type}:`, e);
      return [];
    }
  };

  useEffect(() => {
    const loadTerminologies = async () => {
      setIsTerminologyLoading(true);
      setLoadingError(null);
      onError(null);

      try {
        const speciesPromises = allTermAttributes.map((attr) =>
          fetchSpeciesTerminology(attr)
        );

        const commonNamePromises = commonNameTermAttributes.map((attr) =>
          fetchCommonNameTerminology(attr)
        );

        const results = await Promise.all([
          ...speciesPromises,
          ...commonNamePromises,
        ]);

        const newTerminologies: Record<string, TerminologyData[]> = {};
        let totalLoaded = 0;

        results.slice(0, allTermAttributes.length).forEach((result, index) => {
          const attr = allTermAttributes[index];
          newTerminologies[attr] = result;
          totalLoaded += result.length;
        });

        results.slice(allTermAttributes.length).forEach((result, index) => {
          const attr = commonNameTermAttributes[index];
          newTerminologies[attr] = result;
        });

        // ** DEBUGGING LOGS **
        console.log("Terminologies loaded successfully:", newTerminologies);
        const languageCount = newTerminologies["language"]
          ? newTerminologies["language"].length
          : 0;
        console.log(`Language entries found: ${languageCount}`);

        setTerminologies(newTerminologies);

        if (Object.keys(newTerminologies).length < allTermAttributes.length) {
          if (
            newTerminologies.body_shape &&
            newTerminologies.body_shape.length === 0
          ) {
            setLoadingError(
              "⚠️ Failed to load core filter options. Please try again."
            );
          }
        }
      } catch (error) {
        setLoadingError("Error loading search criteria.");
        onError("Error loading search criteria.");
      } finally {
        setIsTerminologyLoading(false);
      }
    };

    loadTerminologies();
  }, []);

  const handleSelectChange = (e: any) => {
    setSelections({
      ...selections,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchStart();
    onError(null);

    const activeFilters = Object.entries(selections)
      .filter(([, value]) => value !== "")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(activeFilters).length === 0) {
      onError("Please select at least one filter criteria.");
      return;
    }

    onSearch(activeFilters);
  };

  const getFriendlyLabel = (attribute: string) => {
    const labels: Record<string, string> = {
      body_shape: "Body Shape",
      catching_method: "Catching Method",
      electrogenic: "Electrogenic",
      dangerous_species_indicator: "Dangerous",
      used_as_bait: "Used as Bait",
      used_for_aquaculture: "Aquaculture",
      migration_type: "Migration",
      air_breathing_status: "Air Breathing",
      importance: "Importance",
      vulnerability_fishing: "Vulnerability",
      salt_water_environment: "Saltwater",
      freshwater_environment: "Freshwater",
      brackish_water_environment: "Brackish Water",
      language: "Common Name Language",
    };
    return labels[attribute] || attribute.replace(/_/g, " ");
  };

  const cardBg = "#1f2937";
  const inputBg = "#2d3748";
  const primaryText = "#ffffff";
  const secondaryText = "#9ca3af";
  const accentColor = "#2AB4C3";
  const borderColor = "rgba(42, 180, 195, 0.2)";

  return (
    <Box
      sx={{
        borderRadius: 3,
        background: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        mb: 4,
      }}
    >
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          cursor: "pointer",
          transition: "background 0.2s",
          "&:hover": {
            background: "rgba(42, 180, 195, 0.05)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${accentColor}, #10b981)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 8px ${accentColor}40`,
            }}
          >
            <TuneIcon sx={{ color: "white", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: primaryText,
                fontSize: "1.1rem",
                mb: 0.25,
              }}
            >
              Advanced Search
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: secondaryText,
                fontSize: "0.8rem",
              }}
            >
              {isExpanded
                ? "Click to collapse"
                : "Click to expand and refine your search"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          sx={{
            color: accentColor,
            transition: "transform 0.3s",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2.5,
            pt: 0,
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          {loadingError && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  "& .MuiAlert-message": {
                    fontWeight: 500,
                  },
                }}
              >
                {loadingError}
              </Alert>
            </Fade>
          )}

          {isTerminologyLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                gap: 2,
              }}
            >
              <CircularProgress size={40} sx={{ color: accentColor }} />
              <Typography
                color={secondaryText}
                sx={{ fontWeight: 500, fontSize: "0.9rem" }}
              >
                Loading filters...
              </Typography>
            </Box>
          ) : (
            <Fade in timeout={500}>
              <Grid container spacing={2}>
                {commonNameTermAttributes.map((attribute) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={attribute}>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        minWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: inputBg,
                          color: primaryText,
                          fontSize: "0.875rem",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: accentColor,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${accentColor}30`,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: accentColor,
                              borderWidth: 1,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          },
                        },
                        "& .MuiSelect-icon": {
                          color: secondaryText,
                        },
                      }}
                    >
                      <InputLabel
                        id={`${attribute}-label`}
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: secondaryText,
                          "&.Mui-focused": {
                            color: accentColor,
                          },
                        }}
                      >
                        {getFriendlyLabel(attribute)}
                      </InputLabel>
                      <Select
                        labelId={`${attribute}-label`}
                        id={attribute}
                        name={attribute}
                        value={selections[attribute] || ""}
                        label={getFriendlyLabel(attribute)}
                        onChange={handleSelectChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: inputBg,
                              color: primaryText,
                              maxHeight: 300,
                              "& .MuiMenuItem-root": {
                                fontSize: "0.875rem",
                                "&:hover": {
                                  bgcolor: "rgba(42, 180, 195, 0.1)",
                                },
                                "&.Mui-selected": {
                                  bgcolor: "rgba(42, 180, 195, 0.2)",
                                  "&:hover": {
                                    bgcolor: "rgba(42, 180, 195, 0.25)",
                                  },
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="">-- All --</MenuItem>
                        {terminologies[attribute]?.map((term) => (
                          <MenuItem key={term.id} value={term.name}>
                            {term.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}

                {/* ΥΠΟΛΟΙΠΑ ΦΙΛΤΡΑ (Species Attributes) */}
                {allTermAttributes.map((attribute) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={attribute}>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        minWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: inputBg,
                          color: primaryText,
                          fontSize: "0.875rem",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: accentColor,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${accentColor}30`,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: accentColor,
                              borderWidth: 1,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          },
                        },
                        "& .MuiSelect-icon": {
                          color: secondaryText,
                        },
                      }}
                    >
                      <InputLabel
                        id={`${attribute}-label`}
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: secondaryText,
                          "&.Mui-focused": {
                            color: accentColor,
                          },
                        }}
                      >
                        {getFriendlyLabel(attribute)}
                      </InputLabel>
                      <Select
                        labelId={`${attribute}-label`}
                        id={attribute}
                        name={attribute}
                        value={selections[attribute] || ""}
                        label={getFriendlyLabel(attribute)}
                        onChange={handleSelectChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: inputBg,
                              color: primaryText,
                              maxHeight: 300,
                              "& .MuiMenuItem-root": {
                                fontSize: "0.875rem",
                                "&:hover": {
                                  bgcolor: "rgba(42, 180, 195, 0.1)",
                                },
                                "&.Mui-selected": {
                                  bgcolor: "rgba(42, 180, 195, 0.2)",
                                  "&:hover": {
                                    bgcolor: "rgba(42, 180, 195, 0.25)",
                                  },
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="">-- All --</MenuItem>
                        {terminologies[attribute]?.map((term) => (
                          <MenuItem key={term.id} value={term.name}>
                            {term.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}

                {[
                  "salt_water_environment",
                  "freshwater_environment",
                  "brackish_water_environment",
                ].map((env) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={env}>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        minWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: inputBg,
                          color: primaryText,
                          fontSize: "0.875rem",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: accentColor,
                          },
                          "&.Mui-focused": {
                            boxShadow: `0 0 0 2px ${accentColor}30`,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: accentColor,
                              borderWidth: 1,
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          },
                        },
                        "& .MuiSelect-icon": {
                          color: secondaryText,
                        },
                      }}
                    >
                      <InputLabel
                        id={`${env}-label`}
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          color: secondaryText,
                          "&.Mui-focused": {
                            color: accentColor,
                          },
                        }}
                      >
                        {getFriendlyLabel(env)}
                      </InputLabel>
                      <Select
                        labelId={`${env}-label`}
                        id={env}
                        name={env}
                        value={selections[env] || ""}
                        label={getFriendlyLabel(env)}
                        onChange={handleSelectChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: inputBg,
                              color: primaryText,
                              "& .MuiMenuItem-root": {
                                fontSize: "0.875rem",
                                "&:hover": {
                                  bgcolor: "rgba(42, 180, 195, 0.1)",
                                },
                                "&.Mui-selected": {
                                  bgcolor: "rgba(42, 180, 195, 0.2)",
                                  "&:hover": {
                                    bgcolor: "rgba(42, 180, 195, 0.25)",
                                  },
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="">-- Any --</MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                ))}

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    fullWidth
                    disabled={isTerminologyLoading}
                    startIcon={<SearchIcon />}
                    sx={{
                      py: 1.25,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textTransform: "none",
                      background: `linear-gradient(90deg, ${accentColor} 0%, #10b981 100%)`,
                      color: "white",
                      boxShadow: `0 4px 10px ${accentColor}40`,
                      transition: "all 0.3s",
                      "&:hover": {
                        background: `linear-gradient(90deg, #10b981 0%, ${accentColor} 100%)`,
                        boxShadow: `0 6px 14px ${accentColor}60`,
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    Search Species
                  </Button>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default AdvancedSearchForm;
