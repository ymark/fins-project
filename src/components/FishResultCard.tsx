import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Grid,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface FishResultCardProps {
  commonName: string;
  scientificName: string;
  typeLabel: string;
  taxonomy: {
    class: string;
    order: string;
    family: string;
  };
  habitatInfo: {
    maxDepth: string;
    environment: string;
  };
  imageUrl?: string;
  statusLabel?: string;
  rarityLabel?: string;
  population?: string;
  region?: string;
  description?: string;
  onClick?: () => void;
}

const FishResultCard: React.FC<FishResultCardProps> = ({
  commonName,
  scientificName,
  imageUrl = "https://placehold.co/400x300/1a568b/ffffff?text=Fish",
  statusLabel = "Stable",
  rarityLabel = "Common",
  population = "N/A",
  region = "N/A",
  description,
  onClick,
}) => {
  const cardBg = "#1f2937";
  const infoBoxBg = "#2d384b";
  const titleColor = "#ffffff";
  const subtitleColor = "#b4c2d8";

  const viewButtonGradient = "linear-gradient(90deg, #2AB4C3 0%, #10b981 100%)";

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Stable: "#10b981", // Green
      Declining: "#f59e0b", // Amber
      Vulnerable: "#ef4444", // Red
      Unknown: "#6b7280", // Gray
    };
    return statusMap[status] || "#6b7280";
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.5)",
        transition: "0.3s",
        bgcolor: cardBg,
        color: titleColor,
        border: "1px solid rgba(42, 180, 195, 0.1)",
        width: "350px", // <<< MUST BE 100% to fit the Grid item width
        height: "610px", // <<< REDUCED HEIGHT for proportionality
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.7)",
          transform: "translateY(-5px)",
        },
      }}
    >
      {/* 1. Image Section - Now uses a responsive aspect ratio */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3", // Set responsive aspect ratio for wider image
          overflow: "hidden",
          backgroundColor: "#374151",
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          flexShrink: 0,
        }}
      >
        <Box
          className="card-image"
          component="img"
          src={imageUrl}
          alt={commonName}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
        />
        <Chip
          label={statusLabel}
          size="medium"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "#ffffff",
            color: cardBg,
            fontWeight: 600,
            fontSize: "0.85rem",
            height: 28,
            borderRadius: "6px",
          }}
        />
      </Box>

      {/* 2. Content Section - Now flexible height */}
      <Box
        sx={{
          p: "20px", // Reduced padding slightly for compactness
          display: "flex",
          flexDirection: "column",
          bgcolor: cardBg,
          flexShrink: 0,
          flexGrow: 1, // Allow content to stretch if needed
        }}
      >
        {/* Title Section - Now flexible height */}
        <Box
          sx={{
            mb: "16px", // Reduced margin
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              mb: "6px", // Reduced margin
            }}
          >
            <Typography
              sx={{
                color: titleColor,
                fontWeight: 700,
                fontSize: "1.25rem", // Reduced font size for compactness
                lineHeight: "28px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                height: "28px",
              }}
            >
              {commonName}
            </Typography>
            <Chip
              label={rarityLabel}
              size="small"
              sx={{
                backgroundColor: infoBoxBg,
                color: subtitleColor,
                fontWeight: 600,
                fontSize: "0.7rem", // Reduced font size
                height: 22,
                borderRadius: "6px",
                flexShrink: 0,
                px: 1,
                mt: "3px", // Align chip slightly lower
              }}
            />
          </Box>
          <Typography
            sx={{
              color: subtitleColor,
              fontSize: "0.9rem",
              fontStyle: "italic",
              opacity: 0.9,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              height: "20px",
              mb: "6px",
            }}
          >
            {scientificName}
          </Typography>
          <Typography
            sx={{
              color: subtitleColor,
              fontSize: "0.9rem",
              lineHeight: "20px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2, // Allow max 2 lines for description
              WebkitBoxOrient: "vertical",
              // Remove fixed height to allow wrapping up to 2 lines
              mt: 1,
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Info Boxes - Now flexible height */}
        <Box
          sx={{
            mb: "16px", // Reduced margin
            flexShrink: 0,
            mt: "auto", // Push the info boxes down
          }}
        >
          <Grid
            container
            spacing={1.5} // Reduced spacing
            sx={{ height: "100%", m: 0, width: "100%" }}
          >
            <Grid
              item
              xs={6}
              sx={{ p: 0, pl: "0 !important", pt: "0 !important" }}
            >
              <Box
                sx={{
                  bgcolor: infoBoxBg,
                  p: "12px", // Reduced padding
                  borderRadius: 2,
                  height: "80px", // Set a compact fixed height for info boxes
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: subtitleColor,
                    mb: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Population
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: titleColor,
                    fontSize: "1.2rem", // Reduced font size
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "24px",
                  }}
                >
                  {population}
                </Typography>
              </Box>
            </Grid>

            <Grid
              item
              xs={6}
              sx={{ p: 0, pr: "0 !important", pt: "0 !important" }}
            >
              <Box
                sx={{
                  bgcolor: infoBoxBg,
                  p: "12px", // Reduced padding
                  borderRadius: 2,
                  height: "80px", // Set a compact fixed height for info boxes
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  ml: "12px", // Adjusted margin to match new spacing
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: subtitleColor,
                    mb: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Region
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: titleColor,
                    fontSize: "1.1rem", // Reduced font size
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "24px",
                  }}
                >
                  {region}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons - Now flexible height */}
        <Box
          sx={{
            display: "flex",
            gap: "12px", // Reduced gap
            flexShrink: 0,
            mt: "16px", // Space above buttons
          }}
        >
          <IconButton
            sx={{
              border: `1px solid ${infoBoxBg}`,
              bgcolor: infoBoxBg,
              color: subtitleColor,
              width: "48px", // Reduced button size
              height: "48px",
              minWidth: "48px",
              minHeight: "48px",
              borderRadius: 2,
              flexShrink: 0,
              p: 0,
              "&:hover": {
                bgcolor: "#3c485c",
                color: "#2AB4C3",
              },
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>

          <Button
            onClick={onClick}
            fullWidth
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: "48px", // Reduced button height
              minHeight: "48px",
              maxHeight: "48px",
              borderRadius: 2,
              background: viewButtonGradient,
              color: titleColor,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 10px rgba(16, 185, 129, 0.4)",
              p: "12px 24px",
              "&:hover": {
                background: "linear-gradient(90deg, #10b981 0%, #2AB4C3 100%)",
                boxShadow: "0 6px 15px rgba(16, 185, 129, 0.6)",
              },
            }}
          >
            View
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default FishResultCard;
