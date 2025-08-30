import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  MapPin,
  Upload,
  AlertTriangle,
  Image,
  X,
  ArrowLeft,
  Save,
  Leaf,
  Camera,
  MapPinned,
  AlertOctagon,
  Calendar,
  Info,
  Crosshair,
} from "lucide-react";
import { reportsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import MapSelector from "../../components/UI/MapSelector";

const SubmitReportPage = () => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const formSteps = [
    { id: 1, title: "Basic Information", icon: Info },
    { id: 2, title: "Location Details", icon: MapPinned },
    { id: 3, title: "Evidence & Media", icon: Camera },
    { id: 4, title: "Additional Details", icon: AlertOctagon },
  ];

  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      caption: "",
    }));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewImages[index].url);
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
        });
        setUseCurrentLocation(true);
        toast.success("Location detected successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location");
        setUseCurrentLocation(false);
      }
    );
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, formSteps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (!data.title || !data.description || !data.category) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!coordinates.lat || !coordinates.lng) {
        toast.error("Please select a location on the map");
        return;
      }

      const formData = new FormData();

      // Add required fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);

      // Add optional fields if present
      if (data.severity) {
        formData.append("severity", data.severity);
      }
      if (data.subCategory) {
        formData.append("subCategory", data.subCategory);
      }

      // Add location data in the exact format expected by backend
      // Validate coordinates
      const longitude = parseFloat(coordinates.lng);
      const latitude = parseFloat(coordinates.lat);

      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        toast.error("Invalid longitude! Must be between -180 and 180");
        return;
      }
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        toast.error("Invalid latitude! Must be between -90 and 90");
        return;
      }

      // Create GeoJSON Point
      const locationData = {
        type: "Point",
        coordinates: [longitude, latitude], // MongoDB expects [longitude, latitude]
      };
      formData.append("location", JSON.stringify(locationData));

      photos.forEach((photo, index) => {
        formData.append("media", photo);
        if (data[`mediaCaption_${index}`]) {
          formData.append(
            `mediaCaption_${index}`,
            data[`mediaCaption_${index}`]
          );
        }
      });

        const response = await reportsAPI.create(formData);
        toast.success("Report submitted successfully!");
        navigate("/reports");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                placeholder="E.g., Illegal mangrove cutting at Henderson Bay"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Incident Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select a category</option>
                <option value="illegal_cutting">Illegal Cutting</option>
                <option value="land_reclamation">Land Reclamation</option>
                <option value="pollution">Pollution</option>
                <option value="construction">Construction</option>
                <option value="natural_damage">Natural Damage</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                placeholder="Please provide a detailed description of what you observed..."
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-teal-800 dark:text-teal-300">
                  Location Details
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                  Please provide accurate location information to help us
                  identify and address the issue effectively.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  Use Current Location
                </button>
                {coordinates.lat && coordinates.lng && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {coordinates.lat.toFixed(6)},{" "}
                    {coordinates.lng.toFixed(6)}
                  </div>
                )}
              </div>

              <MapSelector
                coordinates={coordinates}
                onLocationSelect={(location) => {
                  setCoordinates({
                    lat: location.lat,
                    lng: location.lng,
                  });
                  toast.success("Location selected!");
                }}
              />

              <div>
                <label
                  htmlFor="mangroveArea"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Mangrove Area Name
                </label>
                <input
                  type="text"
                  id="mangroveArea"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  placeholder="E.g., Henderson Bay Mangroves"
                  {...register("mangroveArea")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="latitude"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  value={coordinates.lat}
                  onChange={(e) =>
                    setCoordinates((prev) => ({ ...prev, lat: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  placeholder="Enter latitude"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Longitude (between -180 and 180)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    value={coordinates.lng}
                    onChange={(e) =>
                      setCoordinates((prev) => ({
                        ...prev,
                        lng: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    placeholder="E.g., 72.8777 for Mumbai"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Get Current Location
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg flex items-start gap-3">
              <Camera className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-teal-800 dark:text-teal-300">
                  Evidence & Media
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                  Upload photos or videos to document the incident. This will
                  help verify and assess the situation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Choose files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handlePhotoSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-900 dark:file:text-teal-300"
                />
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      {...register(`mediaCaption_${index}`)}
                      className="absolute bottom-2 left-2 right-2 px-2 py-1 text-sm bg-white/80 dark:bg-black/80 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="severity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Incident Severity
              </label>
              <select
                id="severity"
                {...register("severity")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="estimatedArea"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Estimated Affected Area (if applicable)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  id="estimatedArea"
                  {...register("estimatedArea.value")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  placeholder="Enter value"
                />
                <select
                  {...register("estimatedArea.unit")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value="sq_meters">Square Meters</option>
                  <option value="sq_kilometers">Square Kilometers</option>
                  <option value="hectares">Hectares</option>
                  <option value="acres">Acres</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                {...register("tags")}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/reports")}
            className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Leaf className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              Submit Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Help protect mangrove ecosystems by reporting incidents
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {formSteps.map((step) => (
              <motion.div
                key={step.id}
                className={`flex-1 relative ${
                  step.id === currentStep
                    ? "text-teal-600 dark:text-teal-400"
                    : step.id < currentStep
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.id * 0.1 }}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.id === currentStep
                        ? "bg-teal-100 dark:bg-teal-900"
                        : step.id < currentStep
                        ? "bg-teal-600 dark:bg-teal-700"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  {step.id !== formSteps.length && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        step.id < currentStep
                          ? "bg-teal-600 dark:bg-teal-700"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
                <div className="text-center mt-2 text-sm font-medium">
                  {step.title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">{renderFormStep()}</AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/reports")}
                  className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  {currentStep < formSteps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 rounded-lg bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-400 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 rounded-lg bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Report"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitReportPage;
