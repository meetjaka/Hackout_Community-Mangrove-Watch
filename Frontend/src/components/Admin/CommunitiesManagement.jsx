import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  MapPin,
  Eye,
  EyeOff,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CommunitiesManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: [0, 0]
    },
    focusAreas: [],
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    }
  });

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCommunityList();
      if (response.data.success) {
        setCommunities(response.data.data.communities || []);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFocusAreaChange = (index, value) => {
    const newFocusAreas = [...formData.focusAreas];
    newFocusAreas[index] = value;
    setFormData(prev => ({
      ...prev,
      focusAreas: newFocusAreas
    }));
  };

  const addFocusArea = () => {
    setFormData(prev => ({
      ...prev,
      focusAreas: [...prev.focusAreas, '']
    }));
  };

  const removeFocusArea = (index) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: {
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: [0, 0]
      },
      focusAreas: [],
      contactInfo: {
        email: '',
        phone: '',
        website: ''
      }
    });
    setEditingCommunity(null);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    resetForm();
  };

  const openEditModal = (community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description,
      location: community.location || {
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: [0, 0]
      },
      focusAreas: community.focusAreas || [],
      contactInfo: community.contactInfo || {
        email: '',
        phone: '',
        website: ''
      }
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCommunity) {
        await adminAPI.updateCommunity(editingCommunity._id, formData);
        toast.success('Community updated successfully');
      } else {
        await adminAPI.createCommunity(formData);
        toast.success('Community created successfully');
      }

      setShowAddModal(false);
      resetForm();
      fetchCommunities();
    } catch (error) {
      console.error('Error saving community:', error);
      toast.error('Failed to save community');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this community?')) {
      return;
    }

    try {
      await adminAPI.deleteCommunity(id);
      toast.success('Community deleted successfully');
      fetchCommunities();
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error('Failed to delete community');
    }
  };

  const toggleStatus = async (community) => {
    try {
      const newStatus = !community.isActive;
      await adminAPI.updateCommunity(community._id, { isActive: newStatus });
      toast.success(`Community ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCommunities();
    } catch (error) {
      console.error('Error updating community status:', error);
      toast.error('Failed to update community status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Communities Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage community instances
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Community
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Communities ({communities.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {communities.map((community) => (
            <div key={community._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {community.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      community.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {community.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {community.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{community.totalMembers || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{community.location?.city || 'N/A'}, {community.location?.state || 'N/A'}</span>
                    </div>
                  </div>

                  {community.focusAreas && community.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {community.focusAreas.map((area, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleStatus(community)}
                    className={`p-2 rounded-lg ${
                      community.isActive
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={community.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {community.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(community)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(community._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {communities.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No communities found. Create your first community to get started.
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddEditCommunityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
          formData={formData}
          onInputChange={handleInputChange}
          onFocusAreaChange={handleFocusAreaChange}
          addFocusArea={addFocusArea}
          removeFocusArea={removeFocusArea}
          editingCommunity={editingCommunity}
        />
      )}
    </div>
  );
};

const AddEditCommunityModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onInputChange, 
  onFocusAreaChange,
  addFocusArea,
  removeFocusArea,
  editingCommunity 
}) => {
  if (!isOpen) return null;

  const isEditing = !!editingCommunity;
  const title = isEditing ? 'Edit Community' : 'Add New Community';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Community Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={onInputChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={onInputChange}
                placeholder="contact@community.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={onInputChange}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={onInputChange}
                placeholder="Mumbai"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={onInputChange}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={onInputChange}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Focus Areas
            </label>
            <div className="space-y-2">
              {formData.focusAreas.map((area, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => onFocusAreaChange(index, e.target.value)}
                    placeholder="e.g., Mangrove Conservation"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeFocusArea(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFocusArea}
                className="inline-flex items-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Focus Area
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunitiesManagement;
