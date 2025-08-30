import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Shield, 
  Users, 
  BarChart3, 
  Trophy, 
  Camera, 
  Globe, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Camera,
      title: 'Report Incidents',
      description: 'Submit geotagged reports with photos and videos to document threats to mangrove ecosystems.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Shield,
      title: 'AI Validation',
      description: 'Advanced AI algorithms validate reports and cross-reference with satellite imagery for accuracy.',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect with fellow conservationists, share knowledge, and participate in community forums.',
      color: 'text-mangrove-600',
      bgColor: 'bg-mangrove-50',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Access comprehensive dashboards and analytics to track conservation efforts and trends.',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn points, badges, and climb leaderboards while contributing to mangrove conservation.',
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Join a worldwide network of citizen scientists protecting mangrove ecosystems.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50,000+', label: 'Reports Submitted' },
    { number: '100+', label: 'Protected Areas' },
    { number: '25+', label: 'Countries' },
  ];

  const benefits = [
    'Contribute to scientific research and conservation efforts',
    'Learn about mangrove ecosystems and their importance',
    'Connect with like-minded conservationists worldwide',
    'Earn recognition and rewards for your contributions',
    'Access educational resources and training materials',
    'Participate in community events and workshops',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-mangrove-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-mangrove-500 rounded-2xl flex items-center justify-center shadow-mangrove">
                <MapPin className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Protect Our
              <span className="text-gradient block"> Mangrove Ecosystems</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of citizen scientists worldwide in monitoring and protecting mangrove ecosystems. 
              Report threats, track conservation efforts, and make a real difference for our planet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-mangrove-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Make a Difference
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to contribute to mangrove conservation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-medium transition-shadow duration-300">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Join Community Mangrove Watch?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Become part of a global movement dedicated to protecting one of Earth's most vital ecosystems. 
                Your contributions directly impact conservation efforts and scientific research.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-mangrove-100 to-primary-100 rounded-2xl p-8">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-mangrove-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Every Report Counts
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Whether you're a seasoned conservationist or just starting your journey, 
                    every report you submit helps protect mangrove ecosystems for future generations.
                  </p>
                  {!isAuthenticated && (
                    <Link to="/register" className="btn-primary">
                      Join the Movement
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-mangrove-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of citizen scientists worldwide and start protecting mangrove ecosystems today.
          </p>
          
          {isAuthenticated ? (
            <Link to="/reports/submit" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center">
              Submit Your First Report
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Get Started Free
              </Link>
              <Link to="/about" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Learn More
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
