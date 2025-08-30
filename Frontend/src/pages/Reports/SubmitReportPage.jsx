import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, Upload, AlertTriangle, Image, X, ArrowLeft, Save } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SubmitReportPage = () => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // Monitor the values of these fields
  const category = watch('category');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Add location data to form
      const reportData = {
        ...data,
        location: {
          coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            country: data.country,
            zipCode: data.zipCode
          },
          mangroveArea: data.mangroveArea,
          nearestLandmark: data.nearestLandmark
        },
        // Add photo files to media array
        media: photos
      };
      
      // In a real app, this would submit to the backend
      // const response = await reportsAPI.create(reportData);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Report submitted successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit the number of photos
    const remainingSlots = 5 - photos.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    
    // Add to photos array
    setPhotos(prev => [...prev, ...filesToProcess]);
    
    // Create preview URLs
    const newPreviewImages = filesToProcess.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
  };
  
  const removePhoto = (index) => {
    // Remove from photos array
    setPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index].preview);
    
    // Remove from preview images
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        });
        setUseCurrentLocation(true);
        toast.success('Current location detected');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your current location');
        setUseCurrentLocation(false);
      }
    );
  };
  
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/reports')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Report a new incident or threat to mangrove ecosystems
            </p>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Incident Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="form-label">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      className={`form-input w-full ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Provide a clear, descriptive title"
                      {...register('title', { 
                        required: 'Title is required',
                        maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
                      })}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="form-label">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className={`form-input w-full ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Provide a detailed description of what you observed"
                      {...register('description', { 
                        required: 'Description is required',
                        maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                      })}
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="form-label">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        className={`form-select w-full ${errors.category ? 'border-red-500' : ''}`}
                        {...register('category', { required: 'Category is required' })}
                      >
                        <option value="">Select a category</option>
                        <option value="illegal_cutting">Illegal Cutting</option>
                        <option value="land_reclamation">Land Reclamation</option>
                        <option value="pollution">Pollution</option>
                        <option value="dumping">Dumping</option>
                        <option value="construction">Construction</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>
                    
                    {category === 'other' && (
                      <div>
                        <label htmlFor="subCategory" className="form-label">
                          Specify Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="subCategory"
                          type="text"
                          className={`form-input w-full ${errors.subCategory ? 'border-red-500' : ''}`}
                          placeholder="Specify the category"
                          {...register('subCategory', { 
                            required: category === 'other' ? 'Please specify the category' : false
                          })}
                        />
                        {errors.subCategory && (
                          <p className="text-red-500 text-sm mt-1">{errors.subCategory.message}</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="severity" className="form-label">
                        Severity <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="severity"
                        className={`form-select w-full ${errors.severity ? 'border-red-500' : ''}`}
                        {...register('severity', { required: 'Severity is required' })}
                      >
                        <option value="">Select severity level</option>
                        <option value="low">Low - Minor impact</option>
                        <option value="medium">Medium - Moderate impact</option>
                        <option value="high">High - Significant impact</option>
                        <option value="critical">Critical - Severe impact</option>
                      </select>
                      {errors.severity && (
                        <p className="text-red-500 text-sm mt-1">{errors.severity.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <button
                      type="button"
                      className="btn-outline flex items-center space-x-2"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Use Current Location</span>
                    </button>
                    
                    {useCurrentLocation && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Current location set
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="lat" className="form-label">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lat"
                        type="text"
                        className={`form-input w-full ${errors.lat ? 'border-red-500' : ''}`}
                        placeholder="e.g., 25.276987"
                        value={coordinates.lat}
                        onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                        {...register('lat', { 
                          required: 'Latitude is required',
                          pattern: {
                            value: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
                            message: 'Please enter a valid latitude (-90 to 90)'
                          }
                        })}
                      />
                      {errors.lat && (
                        <p className="text-red-500 text-sm mt-1">{errors.lat.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="lng" className="form-label">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lng"
                        type="text"
                        className={`form-input w-full ${errors.lng ? 'border-red-500' : ''}`}
                        placeholder="e.g., 55.296249"
                        value={coordinates.lng}
                        onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
                        {...register('lng', { 
                          required: 'Longitude is required',
                          pattern: {
                            value: /^-?((1[0-7]|[1-9])?[0-9](\.[0-9]+)?|180(\.0+)?)$/,
                            message: 'Please enter a valid longitude (-180 to 180)'
                          }
                        })}
                      />
                      {errors.lng && (
                        <p className="text-red-500 text-sm mt-1">{errors.lng.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mangroveArea" className="form-label">
                      Mangrove Area Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="mangroveArea"
                      type="text"
                      className={`form-input w-full ${errors.mangroveArea ? 'border-red-500' : ''}`}
                      placeholder="e.g., Eastern Mangrove Park"
                      {...register('mangroveArea', { required: 'Mangrove area name is required' })}
                    />
                    {errors.mangroveArea && (
                      <p className="text-red-500 text-sm mt-1">{errors.mangroveArea.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="nearestLandmark" className="form-label">
                      Nearest Landmark
                    </label>
                    <input
                      id="nearestLandmark"
                      type="text"
                      className="form-input w-full"
                      placeholder="e.g., Near Fishing Dock, 500m east of Beach Resort"
                      {...register('nearestLandmark')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="form-label">
                        City/Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        className={`form-input w-full ${errors.city ? 'border-red-500' : ''}`}
                        {...register('city', { required: 'City is required' })}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="form-label">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="state"
                        type="text"
                        className={`form-input w-full ${errors.state ? 'border-red-500' : ''}`}
                        {...register('state', { required: 'State is required' })}
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="form-label">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="country"
                        type="text"
                        className={`form-input w-full ${errors.country ? 'border-red-500' : ''}`}
                        {...register('country', { required: 'Country is required' })}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Photos & Evidence</h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <p className="text-sm">Upload photos as evidence (maximum 5 photos)</p>
                        <p className="text-xs mt-1">Accepted formats: JPG, PNG, HEIC (max 10MB each)</p>
                      </div>
                      <div>
                        <label
                          htmlFor="photos"
                          className="btn-outline mt-2 inline-flex items-center space-x-2 cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Select Photos</span>
                          <input
                            id="photos"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={photos.length >= 5}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {previewImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Uploaded Photos ({previewImages.length}/5)
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {previewImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden group"
                          >
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate('/reports')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitReportPage;
