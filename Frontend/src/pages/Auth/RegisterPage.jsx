import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Building, Phone } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { ROLE_SPECIFIC_FIELDS } from '../../constants/roleFields';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    setError,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('Form data submitted:', data);
      console.log('Selected role:', data.role);
      
      // Format the role-specific data
      const formattedData = {
        ...data,
        roleSpecificInfo: Object.keys(data)
          .filter(key => key.startsWith('roleSpecificInfo.'))
          .reduce((acc, key) => {
            const field = key.split('.')[1];
            acc[field] = data[key];
            return acc;
          }, {})
      };

      console.log('Formatted data:', formattedData);

      const result = await registerUser(formattedData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Registration failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };



  const roles = [
    { value: 'fisherman', label: 'Fisherman', description: 'Report incidents during fishing activities and protect marine ecosystems' },
    { value: 'coastal_resident', label: 'Coastal Resident', description: 'Monitor and report incidents in your local mangrove areas' },
    { value: 'citizen_scientist', label: 'Citizen Scientist', description: 'Report incidents and contribute to conservation efforts' },
    { value: 'ngo_admin', label: 'NGO Representative', description: 'Manage and validate reports from your organization' },
    { value: 'government_officer', label: 'Government Officer', description: 'Enforcement and policy decision making' },
    { value: 'researcher', label: 'Researcher', description: 'Access data for scientific analysis and research' },
    { value: 'local_guide', label: 'Local Guide', description: 'Help monitor and guide conservation activities in your area' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/20">
            <img src="/logo.svg" alt="Mangrove Connect" className="w-16 h-16" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-bold tracking-tight text-white mb-3">
          Join Mangrove Connect
        </h2>
        <p className="text-center text-lg text-gray-300 mb-2">
          Create your account to start your conservation journey
        </p>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-200 underline decoration-primary-400/30 hover:decoration-primary-300/50"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl py-10 px-6 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`w-full px-4 py-4 pl-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                      errors.firstName ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                    }`}
                    placeholder="Enter your first name"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-danger-300 flex items-center">
                    <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`w-full px-4 py-4 pl-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                      errors.lastName ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                    }`}
                    placeholder="Enter your last name"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-danger-300 flex items-center">
                    <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-4 pl-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                  }`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-danger-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`w-full px-4 py-4 pl-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                  }`}
                  placeholder="Enter your phone number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Invalid phone number',
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-danger-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-semibold text-white mb-2">
                Organization (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="organization"
                  type="text"
                  className="w-full px-4 py-4 pl-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 hover:bg-gray-600"
                  placeholder="Enter your organization name"
                  {...register('organization')}
                />
              </div>
            </div>

                                       {/* Role Selection */}
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Please select a role' }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4">Select Your Role</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((role) => (
                        <label key={role.value} className={`relative flex cursor-pointer rounded-xl border-2 p-4 shadow-sm focus:outline-none transition-all duration-200 group ${
                          field.value === role.value 
                            ? 'border-primary-500 bg-primary-900/30 shadow-md ring-2 ring-primary-500/30 scale-105' 
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                        }`}>
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            className="sr-only"
                            checked={field.value === role.value}
                            onChange={(e) => {
                              console.log('Radio clicked:', e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                          <div className="flex flex-1">
                            <div className="flex flex-col">
                              <span className={`block text-sm font-medium ${
                                field.value === role.value 
                                  ? 'text-primary-700 dark:text-primary-300' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {role.label}
                              </span>
                              <span className={`mt-1 flex items-center text-sm ${
                                field.value === role.value 
                                  ? 'text-primary-600 dark:text-primary-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {role.description}
                              </span>
                            </div>
                          </div>
                          {/* Custom Radio Button */}
                          <div className="ml-3 flex h-6 w-6 items-center justify-center">
                            <div className={`h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                              field.value === role.value 
                                ? 'border-primary-600 bg-primary-600' 
                                : 'border-gray-300 dark:border-gray-600 bg-transparent'
                            }`}>
                              {field.value === role.value && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.role && (
                      <p className="mt-1 text-sm text-danger-600">{errors.role.message}</p>
                    )}
                  </div>
                )}
              />

                         {/* Role-specific Fields */}
             {watch('role') && ROLE_SPECIFIC_FIELDS[watch('role')] && (
               <div className="space-y-6 p-6 border-2 border-primary-700 bg-primary-900/20 rounded-xl">
                 <h3 className="text-lg font-semibold text-white">
                   Additional Information for {watch('role').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                 </h3>
                 <div className="text-sm text-gray-300 mb-4">
                   Please fill in the following details for your role
                 </div>
                 {ROLE_SPECIFIC_FIELDS[watch('role')].map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-semibold text-white mb-2">
                      {field.label}
                    </label>
                                         {field.type === 'multiSelect' ? (
                       <div className="space-y-2">
                         <div className="grid grid-cols-2 gap-2">
                           {field.options.map((option) => (
                             <label key={option} className="flex items-center space-x-2 cursor-pointer">
                               <input
                                 type="checkbox"
                                 value={option}
                                 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                 {...register(`${field.name}.${option}`, { 
                                   required: field.required 
                                 })}
                               />
                               <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                             </label>
                           ))}
                         </div>
                       </div>
                     ) : (
                      <input
                        id={field.name}
                        type={field.type}
                        className={`w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                          errors[field.name] ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                        }`}
                        placeholder={field.placeholder}
                        {...register(field.name, { required: field.required })}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-danger-600">
                        {errors[field.name].message || `${field.label} is required`}
                      </p>
                    )}
                  </div>
                                 ))}
               </div>
             )}
             
             {/* No role selected message */}
             {!watch('role') && (
               <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                 <div className="text-center text-gray-500 dark:text-gray-400">
                   <p className="text-sm">Please select a role above to see additional fields</p>
                 </div>
               </div>
             )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-4 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                  }`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-danger-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-4 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-danger-400 focus:ring-danger-400' : 'hover:bg-gray-600'
                  }`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-danger-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-600 rounded bg-gray-700"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions',
                  })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-200">
                  I agree to the{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
                {errors.terms && (
                  <p className="mt-2 text-sm text-danger-300 flex items-center">
                    <span className="w-1.5 h-1.5 bg-danger-400 rounded-full mr-2"></span>
                    {errors.terms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Root error */}
            {errors.root && (
              <div className="rounded-xl bg-danger-900 border border-danger-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="w-2 h-2 bg-danger-400 rounded-full"></span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-200">
                      {errors.root.message}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-4 bg-gradient-to-r from-primary-600 to-mangrove-600 hover:from-primary-700 hover:to-mangrove-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Social registration options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-medium text-gray-200 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-medium text-gray-200 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
