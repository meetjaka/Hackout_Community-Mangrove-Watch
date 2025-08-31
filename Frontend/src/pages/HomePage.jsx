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
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Shield,
      title: 'AI Validation',
      description: 'Advanced AI algorithms validate reports and cross-reference with satellite imagery for accuracy.',
      color: 'text-mangrove-400',
      bgColor: 'bg-mangrove-500/10',
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect with fellow conservationists, share knowledge, and participate in community forums.',
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Access comprehensive dashboards and analytics to track conservation efforts and trends.',
      color: 'text-mangrove-400',
      bgColor: 'bg-mangrove-500/10',
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn points, badges, and climb leaderboards while contributing to mangrove conservation.',
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Join a worldwide network of citizen scientists protecting mangrove ecosystems.',
      color: 'text-mangrove-400',
      bgColor: 'bg-mangrove-500/10',
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
      <section className="relative bg-primary-50 dark:bg-gray-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-mangrove">
                <img src="/logo.svg" alt="Mangrove Connect" className="w-20 h-20" />
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
                <Link to="/dashboard" className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-mangrove-600 hover:from-primary-700 hover:to-mangrove-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary-400">
                  Register Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-mangrove-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </section>



      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary-500/20 hover:border-primary-400/30 transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 border border-white/20`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



                    {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-mangrove-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of citizen scientists worldwide and start protecting mangrove ecosystems today.
          </p>
          
          {isAuthenticated ? (
            <Link to="/reports/submit" className="inline-flex items-center px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary-600 to-mangrove-600 hover:from-primary-700 hover:to-mangrove-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary-400/30">
              Submit Your First Report
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary-600 to-mangrove-600 hover:from-primary-700 hover:to-mangrove-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary-400/30">
                Register
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="inline-flex items-center px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-xl transition-all duration-300 ease-in-out backdrop-blur-sm">
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
