import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3,
  Search,
  Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CommunityManagement = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('resource');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    url: '',
    tags: '',
    difficulty: 'beginner',
    estimatedTime: '',
    language: 'en',
    order: 1
  });

  const fetchCommunityContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCommunityContent();
      if (response.data.success) {
        setResources(response.data.data.resources || []);
        setGuidelines(response.data.data.guidelines || []);
      }
    } catch (error) {
      console.error('Error fetching community content:', error);
      toast.error('Failed to fetch community content');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await adminAPI.getCommunityAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchCommunityContent();
    fetchAnalytics();
  }, [fetchCommunityContent, fetchAnalytics]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredGuidelines = guidelines.filter(guideline => {
    return guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           guideline.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      type: '',
      url: '',
      tags: '',
      difficulty: 'beginner',
      estimatedTime: '',
      language: 'en',
      order: 1
    });
    setEditingItem(null);
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
    resetForm();
  };

  const openEditModal = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category || '',
      type: item.type || '',
      url: item.url || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      difficulty: item.difficulty || 'beginner',
      estimatedTime: item.estimatedTime || '',
      language: item.language || 'en',
      order: item.order || 1
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (modalType === 'resource') {
        if (editingItem) {
          await adminAPI.updateResource(editingItem._id, submitData);
          toast.success('Resource updated successfully');
        } else {
          await adminAPI.addResource(submitData);
          toast.success('Resource added successfully');
        }
      } else {
        if (editingItem) {
          await adminAPI.updateGuideline(editingItem._id, submitData);
          toast.success('Guideline updated successfully');
        } else {
          await adminAPI.addGuideline(submitData);
          toast.success('Guideline added successfully');
        }
      }

      setShowAddModal(false);
      resetForm();
      fetchCommunityContent();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      if (type === 'resource') {
        await adminAPI.deleteResource(id);
        toast.success('Resource deleted successfully');
      } else {
        await adminAPI.deleteGuideline(id);
        toast.success('Guideline deleted successfully');
      }
      fetchCommunityContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const toggleStatus = async (id, type, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      if (type === 'resource') {
        await adminAPI.updateResource(id, { isActive: newStatus });
      } else {
        await adminAPI.updateGuideline(id, { isActive: newStatus });
      }
      toast.success(`${type} status updated`);
      fetchCommunityContent();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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
            Community Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage educational resources, guidelines, and community content
          </p>
        </div>
        
        {analytics && (
          <div className="flex space-x-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="ml-2">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Resources</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {analytics.resources?.active || 0}/{analytics.resources?.total || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="ml-2">
                  <p className="text-sm text-green-600 dark:text-green-400">Guidelines</p>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    {analytics.guidelines?.active || 0}/{analytics.guidelines?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BookOpen className="inline h-4 w-4 mr-2" />
            Educational Resources
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guidelines'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Community Guidelines
          </button>
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'resources' ? 'resources' : 'guidelines'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <button
          onClick={() => openAddModal(activeTab === 'resources' ? 'resource' : 'guideline')}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'resources' ? 'Resource' : 'Guideline'}
        </button>
      </div>

      {activeTab === 'resources' && (
        <ResourcesTab 
          resources={filteredResources}
          onEdit={(resource) => openEditModal(resource, 'resource')}
          onDelete={(id) => handleDelete(id, 'resource')}
          onToggleStatus={(id, status) => toggleStatus(id, 'resource', status)}
        />
      )}

      {activeTab === 'guidelines' && (
        <GuidelinesTab 
          guidelines={filteredGuidelines}
          onEdit={(guideline) => openEditModal(guideline, 'guideline')}
          onDelete={(id) => handleDelete(id, 'guideline')}
          onToggleStatus={(id, status) => toggleStatus(id, 'guideline', status)}
        />
      )}

      {showAddModal && (
        <AddEditModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmit}
          formData={formData}
          onInputChange={handleInputChange}
          modalType={modalType}
          editingItem={editingItem}
        />
      )}
    </div>
  );
};

const ResourcesTab = ({ resources, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Educational Resources ({resources.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {resources.map((resource) => (
          <div key={resource._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {resource.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    resource.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {resource.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {resource.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {resource.category}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {resource.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onToggleStatus(resource._id, resource.isActive)}
                  className={`p-2 rounded-lg ${
                    resource.isActive
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  title={resource.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(resource)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(resource._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No resources found
          </div>
        )}
      </div>
    </div>
  );
};

const GuidelinesTab = ({ guidelines, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Community Guidelines ({guidelines.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {guidelines.map((guideline) => (
          <div key={guideline._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    {guideline.order}
                  </span>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {guideline.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    guideline.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {guideline.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {guideline.description}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onToggleStatus(guideline._id, guideline.isActive)}
                  className={`p-2 rounded-lg ${
                    guideline.isActive
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  title={guideline.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(guideline)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(guideline._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {guidelines.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No guidelines found
          </div>
        )}
      </div>
    </div>
  );
};

const AddEditModal = ({ isOpen, onClose, onSubmit, formData, onInputChange, modalType, editingItem }) => {
  if (!isOpen) return null;

  const isEditing = !!editingItem;
  const title = isEditing ? `Edit ${modalType}` : `Add New ${modalType}`;

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
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {modalType === 'resource' ? 'Category *' : 'Order'}
              </label>
              {modalType === 'resource' ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Category</option>
                  <option value="education">Education</option>
                  <option value="guide">Guide</option>
                  <option value="inspiration">Inspiration</option>
                  <option value="legal">Legal</option>
                  <option value="technical">Technical</option>
                </select>
              ) : (
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={onInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              )}
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

          {modalType === 'resource' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Type</option>
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="case-study">Case Study</option>
                  <option value="reference">Reference</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>
            </div>
          )}

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

export default CommunityManagement;
