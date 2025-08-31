const Report = require("../models/Report");

const createReport = async (reportData, files, user) => {
  // Parse location data if it's a string
  let locationData = reportData.location;
  if (typeof locationData === "string") {
    locationData = JSON.parse(locationData);
  }

  // Process uploaded files
  const media = [];
  if (files && files.length > 0) {
    files.forEach((file, index) => {
      const isVideo = /video/.test(file.mimetype);
      if (isVideo) {
        media.push({
          type: "video",
          url: `/uploads/reports/${file.filename}`,
          caption: reportData[`mediaCaption_${index}`] || "",
          duration: null,
        });
      } else {
        media.push({
          type: "photo",
          url: `/uploads/reports/${file.filename}`,
          caption: reportData[`mediaCaption_${index}`] || "",
          verified: false,
        });
      }
    });
  }

  // Parse tags if present
  let tags = [];
  if (reportData.tags) {
    try {
      tags = typeof reportData.tags === "string" ? JSON.parse(reportData.tags) : reportData.tags;
    } catch (e) {
      tags = [];
    }
  }

  // Parse estimated area if present
  let estimatedArea = null;
  if (reportData.estimatedArea) {
    try {
      estimatedArea = typeof reportData.estimatedArea === "string" ? JSON.parse(reportData.estimatedArea) : reportData.estimatedArea;
    } catch (e) {
      estimatedArea = null;
    }
  }

  // Create new report
  const report = new Report({
    reporter: user.id,
    title: reportData.title,
    description: reportData.description,
    category: reportData.category,
    subCategory: reportData.subCategory,
    severity: reportData.severity || "medium",
    location: {
      type: "Point",
      coordinates: locationData.coordinates,
      address: locationData.address || {},
      mangroveArea: reportData.mangroveArea,
      nearestLandmark: reportData.nearestLandmark,
    },
    incidentDate: new Date(reportData.incidentDate || new Date()),
    estimatedArea,
    tags,
    source: "web",
  });

  // Add media files
  if (media.length > 0) {
    report.photos = media.filter((m) => m.type === "photo");
    report.videos = media.filter((m) => m.type === "video");
  }

  // Save the report
  const savedReport = await report.save();
  return savedReport;
};

module.exports = {
  createReport,
};