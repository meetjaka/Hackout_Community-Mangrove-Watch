import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import {
  MapPin,
  Mail,
  Phone,
  Building,
  User,
  Camera,
  Save,
  Shield,
  Award,
} from "lucide-react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    changePassword,
    loading: authLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    reset: resetProfile,
  } = useForm();
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  // Watch password field for confirmation validation
  const newPassword = watch("newPassword");

  useEffect(() => {
    console.log("ProfilePage mounted/updated:", {
      user,
      authLoading,
      activeTab,
      token: localStorage.getItem("token"),
    });
  }, [user, authLoading, activeTab]);

  // Show loading state while authentication is being checked
  if (authLoading) {
    console.log("ProfilePage: Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    console.log("ProfilePage: No user data available");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to load profile information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  console.log("ProfilePage: Rendering profile content", { user });

  useEffect(() => {
    // Populate form fields with user data when available
    if (user) {
      setProfileValue("firstName", user.firstName);
      setProfileValue("lastName", user.lastName);
      setProfileValue("email", user.email);
      setProfileValue("phone", user.phone);
      setProfileValue(
        "organization",
        typeof user.organization === "string"
          ? user.organization
          : user.organization?.name || ""
      );

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }

      // Set role-specific information if available
      if (user.roleSpecificInfo) {
        Object.keys(user.roleSpecificInfo).forEach((key) => {
          setProfileValue(
            `roleSpecificInfo.${key}`,
            user.roleSpecificInfo[key]
          );
        });
      }
    }
  }, [user, setProfileValue]);

  // Handle profile update
  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Create FormData for avatar upload
      const formData = new FormData();

      // Append all profile fields
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phone", data.phone);
      formData.append("organization", data.organization);

      // Append avatar if selected
      if (data.avatar && data.avatar.length > 0) {
        formData.append("avatar", data.avatar[0]);
      }

      // Append role-specific info
      if (data.roleSpecificInfo) {
        formData.append(
          "roleSpecificInfo",
          JSON.stringify(data.roleSpecificInfo)
        );
      }

      const result = await updateProfile(formData);

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result.success) {
        toast.success("Password changed successfully");
        resetPassword();
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your profile and account settings.
        </p>

        <div className="card mb-6 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-500 to-mangrove-500 h-32 relative"></div>

          <div className="p-6 relative">
            <div className="absolute -top-16 left-6 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 h-32 w-32">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="ml-40">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role &&
                  user.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400">
                <Mail size={16} className="mr-1" />
                <span>{user?.email}</span>
              </div>
              {user?.organization && (
                <div className="mt-1 flex items-center text-gray-500 dark:text-gray-400">
                  <Building size={16} className="mr-1" />
                  <span>
                    {typeof user.organization === "string"
                      ? user.organization
                      : user.organization.name}
                    {user.organization.verified && (
                      <span className="ml-1 text-xs text-primary-500">
                        (Verified)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex -mb-px space-x-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "achievements"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Achievements
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === "profile" && (
          <div className="card p-6">
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>

                {/* Avatar Upload */}
                <div className="mb-6">
                  <label className="form-label">Profile Photo</label>
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 mr-4">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User size={36} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="btn-secondary cursor-pointer">
                      <Camera size={16} className="mr-2" />
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        {...registerProfile("avatar")}
                        onChange={(e) => {
                          registerProfile("avatar").onChange(e);
                          handleAvatarChange(e);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        className={`input-field pl-10 ${
                          profileErrors.firstName
                            ? "border-danger-500 focus:ring-danger-500"
                            : ""
                        }`}
                        {...registerProfile("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "First name must be at least 2 characters",
                          },
                        })}
                      />
                    </div>
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-danger-600">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        type="text"
                        className={`input-field pl-10 ${
                          profileErrors.lastName
                            ? "border-danger-500 focus:ring-danger-500"
                            : ""
                        }`}
                        {...registerProfile("lastName", {
                          required: "Last name is required",
                          minLength: {
                            value: 2,
                            message: "Last name must be at least 2 characters",
                          },
                        })}
                      />
                    </div>
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-danger-600">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-6">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      disabled
                      className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                      {...registerProfile("email")}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="mt-6">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className={`input-field pl-10 ${
                        profileErrors.phone
                          ? "border-danger-500 focus:ring-danger-500"
                          : ""
                      }`}
                      {...registerProfile("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: "Invalid phone number",
                        },
                      })}
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-danger-600">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label htmlFor="organization" className="form-label">
                    Organization (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="organization"
                      type="text"
                      className="input-field pl-10"
                      {...registerProfile("organization")}
                    />
                  </div>
                </div>
              </div>

              {/* Role-specific Information Section */}
              {user?.role && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {user.role
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                    Information
                  </h3>

                  {user.role === "fisherman" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="boatNumber" className="form-label">
                          Boat Registration Number
                        </label>
                        <input
                          id="boatNumber"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.boatNumber")}
                        />
                      </div>
                      <div>
                        <label htmlFor="fishingArea" className="form-label">
                          Primary Fishing Area
                        </label>
                        <input
                          id="fishingArea"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.fishingArea")}
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "coastal_resident" && (
                    <div>
                      <label htmlFor="area" className="form-label">
                        Residential Area
                      </label>
                      <input
                        id="area"
                        type="text"
                        className="input-field"
                        {...registerProfile("roleSpecificInfo.area")}
                      />
                    </div>
                  )}

                  {user.role === "citizen_scientist" && (
                    <div>
                      <label htmlFor="expertise" className="form-label">
                        Area of Expertise
                      </label>
                      <input
                        id="expertise"
                        type="text"
                        className="input-field"
                        {...registerProfile("roleSpecificInfo.expertise")}
                      />
                    </div>
                  )}

                  {user.role === "ngo_admin" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="ngoName" className="form-label">
                          NGO Name
                        </label>
                        <input
                          id="ngoName"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.ngoName")}
                        />
                      </div>
                      <div>
                        <label htmlFor="designation" className="form-label">
                          Designation
                        </label>
                        <input
                          id="designation"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.designation")}
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "government_officer" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="department" className="form-label">
                          Department
                        </label>
                        <input
                          id="department"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.department")}
                        />
                      </div>
                      <div>
                        <label htmlFor="jurisdiction" className="form-label">
                          Area of Jurisdiction
                        </label>
                        <input
                          id="jurisdiction"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.jurisdiction")}
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "researcher" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="institution" className="form-label">
                          Research Institution
                        </label>
                        <input
                          id="institution"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.institution")}
                        />
                      </div>
                      <div>
                        <label htmlFor="researchArea" className="form-label">
                          Research Focus Area
                        </label>
                        <input
                          id="researchArea"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.researchArea")}
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "local_guide" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="experienceYears" className="form-label">
                          Years of Experience
                        </label>
                        <input
                          id="experienceYears"
                          type="number"
                          className="input-field"
                          {...registerProfile(
                            "roleSpecificInfo.experienceYears"
                          )}
                        />
                      </div>
                      <div>
                        <label htmlFor="area" className="form-label">
                          Area of Operation
                        </label>
                        <input
                          id="area"
                          type="text"
                          className="input-field"
                          {...registerProfile("roleSpecificInfo.area")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center justify-center w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Change Tab */}
        {activeTab === "password" && (
          <div className="card p-6">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>

                <div className="mb-6">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className={`input-field ${
                      passwordErrors.currentPassword
                        ? "border-danger-500 focus:ring-danger-500"
                        : ""
                    }`}
                    {...registerPassword("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-danger-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className={`input-field ${
                      passwordErrors.newPassword
                        ? "border-danger-500 focus:ring-danger-500"
                        : ""
                    }`}
                    {...registerPassword("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message:
                          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                      },
                    })}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-danger-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmNewPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    className={`input-field ${
                      passwordErrors.confirmNewPassword
                        ? "border-danger-500 focus:ring-danger-500"
                        : ""
                    }`}
                    {...registerPassword("confirmNewPassword", {
                      required: "Please confirm your new password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-danger-600">
                      {passwordErrors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center justify-center w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Your Achievements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Achievement Cards */}
              <div className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-800/30 border-4 border-amber-200 dark:border-amber-700 flex items-center justify-center mb-4">
                  <Award
                    size={24}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>
                <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                  First Report
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                  Submitted your first mangrove condition report
                </p>
                <div className="mt-4">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
                    Earned on 15 June 2025
                  </span>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center opacity-60">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800/30 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
                  <Award
                    size={24}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                  Frequent Reporter
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                  Submit 10 reports to unlock this achievement
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    3/10
                  </span>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center opacity-60">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800/30 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
                  <Award
                    size={24}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300">
                  Community Champion
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                  Get 5 comments on your reports to unlock this achievement
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    1/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
