
// @'
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from './store';
// import { AuthProvider } from './contexts/AuthContext';
// import { Toaster } from 'react-hot-toast';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import JobsPage from './pages/JobsPage';
// import DashboardPage from './pages/DashboardPage';
// import ProfilePage from './pages/ProfilePage';
// import CompanyPage from './pages/CompanyPage';
// import './styles/globals.css';

// function App() {
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//         <Router>
//           <div className="App">
//             <Routes>
//               <Route path="/" element={<HomePage />} />
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/register" element={<RegisterPage />} />
//               <Route path="/jobs" element={<JobsPage />} />
//               <Route path="/dashboard" element={<DashboardPage />} />
//               <Route path="/profile" element={<ProfilePage />} />
//               <Route path="/company" element={<CompanyPage />} />
//             </Routes>
//             <Toaster position="top-right" />
//           </div>
//         </Router>
//       </AuthProvider>
//     </Provider>
//   );
// }

// export default App;
// '@ | Out-File -FilePath "src\App.js" -Encoding UTF8

// # Page d'accueil (HomePage)
// @'
// import React from 'react';
// import Navbar from '../components/common/Navbar';
// import HeroSection from '../components/common/HeroSection';
// import FeaturesSection from '../components/common/FeaturesSection';
// import '../styles/pages/HomePage.css';

// const HomePage = () => {
//   return (
//     <div className="home-page">
//       <Navbar />
//       <HeroSection />
//       <FeaturesSection />
//     </div>
//   );
// };

// export default HomePage;
// '@ | Out-File -FilePath "src\pages\HomePage.js" -Encoding UTF8

// # Navbar Component
// @'
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-container">
//         <Link to="/" className="logo">
//           <div className="logo-icon">JT</div>
//           JobTracks
//         </Link>
        
//         <ul className={`nav-links ${isMenuOpen ? 'nav-links-mobile' : ''}`}>
//           <li><Link to="/">Accueil</Link></li>
//           <li><Link to="/jobs">Emplois</Link></li>
//           <li><Link to="/company">Entreprises</Link></li>
//           <li><Link to="/contact">Contact</Link></li>
//         </ul>
        
//         <div className="cta-buttons">
//           {user ? (
//             <>
//               <Link to="/dashboard" className="btn btn-secondary">
//                 Dashboard
//               </Link>
//               <button onClick={handleLogout} className="btn btn-primary">
//                 Déconnexion
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="btn btn-secondary">
//                 Connexion
//               </Link>
//               <Link to="/register" className="btn btn-primary">
//                 S'inscrire
//               </Link>
//             </>
//           )}
//         </div>
        
//         <button 
//           className="mobile-menu"
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//         >
//           ☰
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// '@ | Out-File -FilePath "src\components\common\Navbar.js" -Encoding UTF8

// # HeroSection Component
// @'
// import React, { useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import heroImage from '../../assets/images/pers3.png';

// const HeroSection = () => {
//   useEffect(() => {
//     // Animation des statistiques
//     const animateStats = () => {
//       const statNumbers = document.querySelectorAll('.stat-number');
//       statNumbers.forEach((stat) => {
//         const finalValue = stat.textContent;
//         const isPercentage = finalValue.includes('%');
//         const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
//         let currentValue = 0;
//         const increment = numericValue / 50;
        
//         const timer = setInterval(() => {
//           currentValue += increment;
//           if (currentValue >= numericValue) {
//             currentValue = numericValue;
//             clearInterval(timer);
//           }
          
//           if (isPercentage) {
//             stat.textContent = Math.floor(currentValue) + '%';
//           } else if (numericValue >= 1000) {
//             stat.textContent = Math.floor(currentValue / 1000) + 'K+';
//           } else {
//             stat.textContent = Math.floor(currentValue);
//           }
//         }, 50);
//       });
//     };

//     setTimeout(animateStats, 1000);
//   }, []);

//   return (
//     <section className="hero-section">
//       <div className="hero-content">
//         <div className="hero-text">
//           <h1 className="hero-title">
//             Trouvez votre emploi idéal avec JobTracks
//           </h1>
//           <p className="hero-subtitle">
//             La plateforme complète pour connecter talents et entreprises. 
//             Suivez vos candidatures, gérez vos recrutements et accélérez votre carrière.
//           </p>
//           <div className="hero-actions">
//             <Link to="/jobs" className="btn btn-primary">
//               Parcourir les emplois
//             </Link>
//             <Link to="/demo" className="btn btn-secondary">
//               Voir la démo
//             </Link>
//           </div>
//           <div className="stats-grid">
//             <div className="stat-item">
//               <span className="stat-number">10000</span>
//               <span className="stat-label">Emplois actifs</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-number">5000</span>
//               <span className="stat-label">Entreprises</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-number">50000</span>
//               <span className="stat-label">Candidats</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-number">95</span>
//               <span className="stat-label">Taux de satisfaction</span>
//             </div>
//           </div>
//         </div>
//         <div className="hero-visual">
//           <img src={heroImage} alt="Personne travaillant" className="hero-image" />
//           <div className="floating-cards-container">
//             <div className="floating-card">
//               <div className="card-icon">📊</div>
//               <div className="card-title">Suivi en temps réel</div>
//               <div className="card-text">Suivez l'évolution de vos candidatures</div>
//             </div>
//             <div className="floating-card">
//               <div className="card-icon">📱</div>
//               <div className="card-title">Interface moderne</div>
//               <div className="card-text">Expérience utilisateur optimisée</div>
//             </div>
//             <div className="floating-card">
//               <div className="card-icon">🎯</div>
//               <div className="card-title">Matching intelligent</div>
//               <div className="card-text">Trouvez les profils parfaits</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;
// '@ | Out-File -FilePath "src\components\common\HeroSection.js" -Encoding UTF8

// # FeaturesSection Component
// @'
// import React from 'react';

// const FeaturesSection = () => {
//   const features = [
//     {
//       icon: '🔍',
//       title: 'Recherche avancée',
//       description: 'Filtrez les offres par secteur, localisation, salaire et compétences pour trouver l\'emploi qui vous correspond parfaitement.'
//     },
//     {
//       icon: '📈',
//       title: 'Tableau de bord complet',
//       description: 'Visualisez vos candidatures, entretiens et réponses dans un tableau de bord intuitif et personnalisé.'
//     },
//     {
//       icon: '🤝',
//       title: 'Réseau professionnel',
//       description: 'Connectez-vous avec des recruteurs et des professionnels de votre secteur pour élargir vos opportunités.'
//     },
//     {
//       icon: '⚡',
//       title: 'Candidature express',
//       description: 'Postulez en un clic avec votre profil pré-rempli et gagnez du temps dans vos démarches.'
//     },
//     {
//       icon: '🎓',
//       title: 'Formation continue',
//       description: 'Accédez à des ressources de formation pour développer vos compétences et booster votre profil.'
//     },
//     {
//       icon: '🔔',
//       title: 'Alertes intelligentes',
//       description: 'Recevez des notifications personnalisées pour les offres qui correspondent à vos critères de recherche.'
//     }
//   ];

//   return (
//     <section className="features-section">
//       <div className="features-container">
//         <h2 className="section-title">Pourquoi choisir JobTracks ?</h2>
//         <p className="section-subtitle">
//           Découvrez les fonctionnalités qui font de JobTracks la solution de référence 
//           pour votre recherche d'emploi et vos recrutements
//         </p>
//         <div className="features-grid">
//           {features.map((feature, index) => (
//             <div key={index} className="feature-card">
//               <div className="feature-icon">{feature.icon}</div>
//               <h3 className="feature-title">{feature.title}</h3>
//               <p className="feature-text">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturesSection;
// '@ | Out-File -FilePath "src\components\common\FeaturesSection.js" -Encoding UTF8

// # AuthContext
// @'
// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Vérifier si l'utilisateur est connecté au chargement
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
// '@ | Out-File -FilePath "src\contexts\AuthContext.js" -Encoding UTF8

// # Redux Store
// @'
// import { configureStore } from '@reduxjs/toolkit';
// import authSlice from './slices/authSlice';
// import jobsSlice from './slices/jobsSlice';
// import applicationsSlice from './slices/applicationsSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authSlice,
//     jobs: jobsSlice,
//     applications: applicationsSlice,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// '@ | Out-File -FilePath "src\store\index.js" -Encoding UTF8

// # Auth Slice
// @'
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action) => {
//       state.loading = false;
//       state.user = action.payload;
//       state.isAuthenticated = true;
//     },
//     loginFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//     },
//   },
// });

// export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
// export default authSlice.reducer;
// '@ | Out-File -FilePath "src\store\slices\authSlice.js" -Encoding UTF8

// # Jobs Slice
// @'
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   jobs: [],
//   loading: false,
//   error: null,
//   filters: {
//     location: '',
//     category: '',
//     salary: '',
//     type: '',
//   },
// };

// const jobsSlice = createSlice({
//   name: 'jobs',
//   initialState,
//   reducers: {
//     fetchJobsStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     fetchJobsSuccess: (state, action) => {
//       state.loading = false;
//       state.jobs = action.payload;
//     },
//     fetchJobsFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//   },
// });

// export const { fetchJobsStart, fetchJobsSuccess, fetchJobsFailure, setFilters } = jobsSlice.actions;
// export default jobsSlice.reducer;
// '@ | Out-File -FilePath "src\store\slices\jobsSlice.js" -Encoding UTF8

// # Applications Slice
// @'
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   applications: [],
//   loading: false,
//   error: null,
// };

// const applicationsSlice = createSlice({
//   name: 'applications',
//   initialState,
//   reducers: {
//     fetchApplicationsStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     fetchApplicationsSuccess: (state, action) => {
//       state.loading = false;
//       state.applications = action.payload;
//     },
//     fetchApplicationsFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     addApplication: (state, action) => {
//       state.applications.push(action.payload);
//     },
//     updateApplication: (state, action) => {
//       const index = state.applications.findIndex(app => app.id === action.payload.id);
//       if (index !== -1) {
//         state.applications[index] = action.payload;
//       }
//     },
//   },
// });

// export const { 
//   fetchApplicationsStart, 
//   fetchApplicationsSuccess, 
//   fetchApplicationsFailure,
//   addApplication,
//   updateApplication 
// } = applicationsSlice.actions;
// export default applicationsSlice.reducer;
// '@ | Out-File -FilePath "src\store\slices\applicationsSlice.js" -Encoding UTF8

// @'
// * {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
// }

// body {
//   font-family: 'Arial', sans-serif;
//   line-height: 1.6;
//   color: #333;
//   overflow-x: hidden;
// }

// .hero-section {
//   min-height: 100vh;
//   background: 
//     linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(79, 70, 229, 0.3) 100%),
//     url('./image/burreau.png') center/cover;
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   background-attachment: fixed;
//   filter: contrast(1.1) brightness(1.1);
// }

// .hero-section::before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(79, 70, 229, 0.2) 100%);
//   z-index: 1;
// }

// .hero-section::after {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: radial-gradient(ellipse at center, transparent 0%, rgba(30, 58, 138, 0.3) 70%);
//   z-index: 1;
// }

// .hero-section > * {
//   position: relative;
//   z-index: 2;
// }

// .navbar {
//   padding: 1rem 0;
//   background: linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(79, 70, 229, 0.3) 100%);
//   backdrop-filter: blur(15px);
//   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//   position: fixed;
//   width: 100%;
//   top: 0;
//   z-index: 1000;
//   animation: slideDown 0.8s ease-out;
// }

// .nav-container {
//   max-width: 1200px;
//   margin: 0 auto;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 0 2rem;
// }

// .logo {
//   font-size: 2rem;
//   font-weight: bold;
//   color: white;
//   text-decoration: none;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
// }

// .logo-icon {
//   width: 40px;
//   height: 40px;
//   background: linear-gradient(45deg, #10b981, #059669);
//   border-radius: 8px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: white;
//   font-weight: bold;
//   font-size: 1.2rem;
//   box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
// }

// .nav-links {
//   display: flex;
//   list-style: none;
//   gap: 2rem;
// }

// .nav-links a {
//   color: white;
//   text-decoration: none;
//   font-weight: 500;
//   transition: all 0.3s ease;
//   position: relative;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// }

// .nav-links a::after {
//   content: '';
//   position: absolute;
//   bottom: -5px;
//   left: 0;
//   width: 0;
//   height: 2px;
//   background: #10b981;
//   transition: width 0.3s ease;
// }

// .nav-links a:hover::after {
//   width: 100%;
// }

// .cta-buttons {
//   display: flex;
//   gap: 1rem;
// }

// .btn {
//   padding: 0.75rem 1.5rem;
//   border: none;
//   border-radius: 8px;
//   font-weight: 600;
//   text-decoration: none;
//   transition: all 0.3s ease;
//   cursor: pointer;
//   display: inline-block;
// }

// .btn-primary {
//   background: linear-gradient(45deg, #10b981, #059669);
//   color: white;
//   box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
// }

// .btn-primary:hover {
//   transform: translateY(-2px);
//   box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
// }

// .btn-secondary {
//   background: rgba(255, 255, 255, 0.15);
//   color: white;
//   border: 1px solid rgba(255, 255, 255, 0.3);
//   backdrop-filter: blur(10px);
// }

// .btn-secondary:hover {
//   background: rgba(255, 255, 255, 0.25);
//   transform: translateY(-2px);
// }

// .hero-content {
//   flex: 1;
//   display: flex;
//   align-items: center;
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 8rem 2rem 4rem;
//   width: 100%;
// }

// .hero-text {
//   flex: 1;
//   animation: fadeInUp 1s ease-out;
//   background: rgba(30, 58, 138, 0.1);
//   padding: 2rem;
//   border-radius: 20px;
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.1);
// }

// .hero-title {
//   font-size: 3.5rem;
//   font-weight: 700;
//   color: white;
//   margin-bottom: 1.5rem;
//   line-height: 1.2;
//   text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
// }

// .hero-subtitle {
//   font-size: 1.3rem;
//   color: rgba(255, 255, 255, 0.95);
//   margin-bottom: 2rem;
//   max-width: 600px;
//   text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
// }

// .hero-actions {
//   display: flex;
//   gap: 1rem;
//   margin-bottom: 3rem;
// }

// .hero-actions .btn {
//   padding: 1rem 2rem;
//   font-size: 1.1rem;
// }

// .stats-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//   gap: 2rem;
//   margin-top: 3rem;
// }

// .stat-item {
//   text-align: center;
//   color: white;
//   animation: fadeInUp 1s ease-out;
//   background: rgba(255, 255, 255, 0.1);
//   padding: 1rem;
//   border-radius: 15px;
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.2);
// }

// .stat-number {
//   font-size: 2.5rem;
//   font-weight: bold;
//   display: block;
//   margin-bottom: 0.5rem;
//   background: linear-gradient(45deg, #10b981, #34d399);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
// }

// .stat-label {
//   font-size: 0.9rem;
//   opacity: 0.9;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// }

// .hero-visual {
//   flex: 1;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   animation: fadeInRight 1s ease-out;
//   position: relative;
// }

// .hero-image {
//   width: 400px;
//   height: 500px;
//   border-radius: 20px;
//   object-fit: cover;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
//   position: relative;
//   z-index: 2;
//   filter: contrast(1.1) brightness(1.1);
// }

// .floating-cards-container {
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   pointer-events: none;
// }

// .floating-card {
//   background: rgba(255, 255, 255, 0.2);
//   backdrop-filter: blur(20px);
//   border: 1px solid rgba(255, 255, 255, 0.3);
//   border-radius: 16px;
//   padding: 1.2rem;
//   position: absolute;
//   animation: float 3s ease-in-out infinite;
//   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
//   max-width: 180px;
//   pointer-events: auto;
// }

// .floating-card:nth-child(1) {
//   top: 20px;
//   right: -20px;
//   animation-delay: 0s;
// }

// .floating-card:nth-child(2) {
//   top: 50%;
//   left: -30px;
//   transform: translateY(-50%);
//   animation-delay: 1s;
// }

// .floating-card:nth-child(3) {
//   bottom: 30px;
//   right: 20px;
//   animation-delay: 2s;
// }

// .card-icon {
//   width: 40px;
//   height: 40px;
//   background: linear-gradient(45deg, #10b981, #059669);
//   border-radius: 10px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-bottom: 0.8rem;
//   font-size: 1.2rem;
//   color: white;
//   box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
// }

// .card-title {
//   font-size: 1rem;
//   font-weight: 600;
//   color: white;
//   margin-bottom: 0.4rem;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// }

// .card-text {
//   color: rgba(255, 255, 255, 0.9);
//   font-size: 0.8rem;
//   line-height: 1.4;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
// }

// .features-section {
//   padding: 6rem 2rem;
//   background: #f8fafc;
// }

// .features-container {
//   max-width: 1200px;
//   margin: 0 auto;
// }

// .section-title {
//   text-align: center;
//   font-size: 2.5rem;
//   font-weight: 700;
//   color: #1e293b;
//   margin-bottom: 1rem;
// }

// .section-subtitle {
//   text-align: center;
//   font-size: 1.2rem;
//   color: #64748b;
//   margin-bottom: 4rem;
//   max-width: 600px;
//   margin-left: auto;
//   margin-right: auto;
// }

// .features-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   gap: 2rem;
// }

// .feature-card {
//   background: white;
//   padding: 2.5rem;
//   border-radius: 20px;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
//   transition: all 0.3s ease;
//   border: 1px solid #e2e8f0;
// }

// .feature-card:hover {
//   transform: translateY(-5px);
//   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
// }

// .feature-icon {
//   width: 70px;
//   height: 70px;
//   background: linear-gradient(45deg, #4f46e5, #7c3aed);
//   border-radius: 15px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-bottom: 1.5rem;
//   font-size: 1.8rem;
//   color: white;
// }

// .feature-title {
//   font-size: 1.3rem;
//   font-weight: 600;
//   color: #1e293b;
//   margin-bottom: 1rem;
// }

// .feature-text {
//   color: #64748b;
//   line-height: 1.6;
// }

// .mobile-menu {
//   display: none;
//   background: rgba(255, 255, 255, 0.2);
//   color: white;
//   border: 1px solid rgba(255, 255, 255, 0.3);
//   font-size: 1.5rem;
//   cursor: pointer;
//   padding: 0.5rem;
//   border-radius: 8px;
//   backdrop-filter: blur(10px);
// }

// @keyframes slideDown {
//   from {
//     transform: translateY(-100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateY(0);
//     opacity: 1;
//   }
// }

// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translateY(30px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// @keyframes fadeInRight {
//   from {
//     opacity: 0;
//     transform: translateX(30px);
//   }
//   to {
//     opacity: 1;
//     transform: translateX(0);
//   }
// }

// @keyframes float {
//   0%, 100% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
// }

// /* Responsive Design */
// @media (max-width: 768px) {
//   .nav-links {
//     display: none;
//   }

//   .mobile-menu {
//     display: block;
//   }

//   .hero-content {
//     flex-direction: column;
//     text-align: center;
//     padding: 6rem 1rem 2rem;
//   }

//   .hero-text {
//     padding: 1.5rem;
//   }

//   .hero-title {
//     font-size: 2.5rem;
//   }

//   .hero-subtitle {
//     font-size: 1.1rem;
//   }

//   .hero-actions {
//     flex-direction: column;
//     align-items: center;
//   }

//   .stats-grid {
//     grid-template-columns: repeat(2, 1fr);
//   }

//   .cta-buttons {
//     flex-direction: column;
//     gap: 0.5rem;
//   }

//   .hero-visual {
//     margin-top: 2rem;
//   }

//   .hero-image {
//     width: 300px;
//     height: 400px;
//   }

//   .floating-card {
//     padding: 1rem;
//     max-width: 140px;
//   }

//   .floating-card:nth-child(1) {
//     top: 10px;
//     right: -10px;
//   }

//   .floating-card:nth-child(2) {
//     top: 50%;
//     left: -20px;
//   }

//   .floating-card:nth-child(3) {
//     bottom: 20px;
//     right: 10px;
//   }
// }

// @media (max-width: 480px) {
//   .hero-title {
//     font-size: 2rem;
//   }

//   .stats-grid {
//     grid-template-columns: 1fr;
//   }

//   .nav-container {
//     padding: 0 1rem;
//   }

//   .logo {
//     font-size: 1.5rem;
//   }

//   .hero-image {
//     width: 250px;
//     height: 350px;
//   }

//   .floating-card {
//     padding: 0.8rem;
//     max-width: 120px;
//   }

//   .card-icon {
//     width: 30px;
//     height: 30px;
//     font-size: 1rem;
//   }

//   .card-title {
//     font-size: 0.9rem;
//   }

//   .card-text {
//     font-size: 0.75rem;
//   }

//   .hero-text {
//     padding: 1rem;
//   }
// }
// '@ | Out-File -FilePath "src\styles\globals.css" -Encoding UTF8

// # Création des autres pages manquantes

// # Page de connexion
// @'
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-hot-toast';
// import '../styles/pages/AuthPage.css';

// const LoginPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       // Simulation d'une connexion
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const userData = {
//         id: 1,
//         email: formData.email,
//         name: 'Utilisateur Test',
//         role: 'candidat'
//       };
      
//       login(userData);
//       toast.success('Connexion réussie !');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error('Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container">
//         <div className="auth-form">
//           <h2>Connexion</h2>
//           <p>Connectez-vous à votre compte JobTracks</p>
          
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="password">Mot de passe</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <button type="submit" className="btn btn-primary" disabled={loading}>
//               {loading ? 'Connexion...' : 'Se connecter'}
//             </button>
//           </form>
          
//           <p className="auth-link">
//             Pas de compte ? <Link to="/register">S'inscrire</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
// '@ | Out-File -FilePath "src\pages\LoginPage.js" -Encoding UTF8

// # Page d'inscription
// @'
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-hot-toast';
// import '../styles/pages/AuthPage.css';

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'candidat'
//   });
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Les mots de passe ne correspondent pas');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Simulation d'une inscription
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const userData = {
//         id: 1,
//         email: formData.email,
//         name: formData.name,
//         role: formData.role
//       };
      
//       login(userData);
//       toast.success('Inscription réussie !');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error('Erreur lors de l\'inscription');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container">
//         <div className="auth-form">
//           <h2>Inscription</h2>
//           <p>Créez votre compte JobTracks</p>
          
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label htmlFor="name">Nom complet</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="role">Type de compte</label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="candidat">Candidat</option>
//                 <option value="recruteur">Recruteur</option>
//               </select>
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="password">Mot de passe</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
            
//             <button type="submit" className="btn btn-primary" disabled={loading}>
//               {loading ? 'Inscription...' : 'S\'inscrire'}
//             </button>
//           </form>
          
//           <p className="auth-link">
//             Déjà un compte ? <Link to="/login">Se connecter</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
// '@ | Out-File -FilePath "src\pages\RegisterPage.js" -Encoding UTF8

// # Page des emplois
// @'
// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/common/Navbar';
// import JobCard from '../components/jobs/JobCard';
// import JobFilters from '../components/jobs/JobFilters';
// import '../styles/pages/JobsPage.css';

// const JobsPage = () => {
//   const [jobs, setJobs] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [filters, setFilters] = useState({
//     search: '',
//     location: '',
//     category: '',
//     type: '',
//     salary: ''
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulation de récupération des emplois
//     const fetchJobs = async () => {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const mockJobs = [
//         {
//           id: 1,
//           title: 'Développeur Full Stack',
//           company: 'TechCorp',
//           location: 'Paris',
//           type: 'CDI',
//           salary: '45000-55000',
//           category: 'tech',
//           description: 'Nous recherchons un développeur full stack expérimenté...',
//           requirements: ['React', 'Node.js', 'PostgreSQL'],
//           posted: '2024-01-15'
//         },
//         {
//           id: 2,
//           title: 'UX/UI Designer',
//           company: 'Design Studio',
//           location: 'Lyon',
//           type: 'CDI',
//           salary: '38000-45000',
//           category: 'design',
//           description: 'Rejoignez notre équipe créative en tant que UX/UI Designer...',
//           requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping'],
//           posted: '2024-01-14'
//         },
//         {
//           id: 3,
//           title: 'Chef de Projet Digital',
//           company: 'Digital Agency',
//           location: 'Marseille',
//           type: 'CDI',
//           salary: '42000-50000',
//           category: 'management',
//           description: 'Nous cherchons un chef de projet digital dynamique...',
//           requirements: ['Gestion de projet', 'Agile', 'Digital Marketing'],
//           posted: '2024-01-13'
//         }
//       ];
      
//       setJobs(mockJobs);
//       setFilteredJobs(mockJobs);
//       setLoading(false);
//     };

//     fetchJobs();
//   }, []);

//   useEffect(() => {
//     // Filtrage des emplois
//     let filtered = jobs;

//     if (filters.search) {
//       filtered = filtered.filter(job => 
//         job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         job.company.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }

//     if (filters.location) {
//       filtered = filtered.filter(job => 
//         job.location.toLowerCase().includes(filters.location.toLowerCase())
//       );
//     }

//     if (filters.category) {
//       filtered = filtered.filter(job => job.category === filters.category);
//     }

//     if (filters.type) {
//       filtered = filtered.filter(job => job.type === filters.type);
//     }

//     setFilteredJobs(filtered);
//   }, [filters, jobs]);

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   return (
//     <div className="jobs-page">
//       <Navbar />
//       <div className="jobs-container">
//         <div className="jobs-header">
//           <h1>Emplois disponibles</h1>
//           <p>Trouvez l'emploi qui vous correspond</p>
//         </div>
        
//         <JobFilters filters={filters} onFilterChange={handleFilterChange} />
        
//         <div className="jobs-content">
//           {loading ? (
//             <div className="loading">Chargement des emplois...</div>
//           ) : (
//             <div className="jobs-grid">
//               {filteredJobs.map(job => (
//                 <JobCard key={job.id} job={job} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobsPage;
// '@ | Out-File -FilePath "src\pages\JobsPage.js" -Encoding UTF8

// # Page dashboard
// @'
// import React from 'react';
// import Navbar from '../components/common/Navbar';
// import DashboardStats from '../components/dashboard/DashboardStats';
// import RecentApplications from '../components/dashboard/RecentApplications';
// import QuickActions from '../components/dashboard/QuickActions';
// import { useAuth } from '../contexts/AuthContext';
// import '../styles/pages/DashboardPage.css';

// const DashboardPage = () => {
//   const { user } = useAuth();

//   return (
//     <div className="dashboard-page">
//       <Navbar />
//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h1>Tableau de bord</h1>
//           <p>Bienvenue, {user?.name}</p>
//         </div>
        
//         <div className="dashboard-content">
//           <DashboardStats />
//           <div className="dashboard-grid">
//             <RecentApplications />
//             <QuickActions />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;
// '@ | Out-File -FilePath "src\pages\DashboardPage.js" -Encoding UTF8

















// @'
// import React, { useState } from 'react';
// import Navbar from '../components/common/Navbar';
// import { useAuth } from '../contexts/AuthContext';

// const ProfilePage = () => {
//   const { user } = useAuth();
//   const [formData, setFormData] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     phone: '',
//     location: '',
//     bio: ''
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Logic pour sauvegarder le profil
//     console.log('Profile updated:', formData);
//   };

//   return (
//     <div className="profile-page">
//       <Navbar />
//       <div className="profile-container">
//         <div className="profile-header">
//           <h1>Mon Profil</h1>
//           <p>Gérez vos informations personnelles</p>
//         </div>
        
//         <form onSubmit={handleSubmit} className="profile-form">
//           <div className="form-group">
//             <label htmlFor="name">Nom complet</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="phone">Téléphone</label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="location">Localisation</label>
//             <input
//               type="text"
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleChange}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="bio">Bio</label>
//             <textarea
//               id="bio"
//               name="bio"
//               value={formData.bio}
//               onChange={handleChange}
//               rows="4"
//             />
//           </div>
          
//           <button type="submit" className="btn btn-primary">
//             Sauvegarder
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
// '@ | Out-File -FilePath "src\pages\ProfilPage.js" -Encoding UTF8

// # Créer CompanyPage.js
// @' 
// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/common/Navbar';

// const CompanyPage = () => {
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulation de récupération des entreprises
//     const fetchCompanies = async () => {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const mockCompanies = [
//         {
//           id: 1,
//           name: 'TechCorp',
//           industry: 'Technologie',
//           location: 'Paris',
//           employees: '100-500',
//           description: 'Une entreprise innovante dans le domaine de la technologie...',
//           jobs: 12
//         },
//         {
//           id: 2,
//           name: 'Design Studio',
//           industry: 'Design',
//           location: 'Lyon',
//           employees: '10-50',
//           description: 'Studio de design créatif spécialisé dans l\'UX/UI...',
//           jobs: 5
//         },
//         {
//           id: 3,
//           name: 'Digital Agency',
//           industry: 'Marketing Digital',
//           location: 'Marseille',
//           employees: '50-100',
//           description: 'Agence digitale full-service pour les entreprises...',
//           jobs: 8
//         }
//       ];
      
//       setCompanies(mockCompanies);
//       setLoading(false);
//     };

//     fetchCompanies();
//   }, []);

//   return (
//     <div className="company-page">
//       <Navbar />
//       <div className="company-container">
//         <div className="company-header">
//           <h1>Entreprises partenaires</h1>
//           <p>Découvrez nos entreprises partenaires</p>
//         </div>
        
//         <div className="company-content">
//           {loading ? (
//             <div className="loading">Chargement des entreprises...</div>
//           ) : (
//             <div className="company-grid">
//               {companies.map(company => (
//                 <div key={company.id} className="company-card">
//                   <h3>{company.name}</h3>
//                   <p className="company-industry">{company.industry}</p>
//                   <p className="company-location">📍 {company.location}</p>
//                   <p className="company-employees">👥 {company.employees} employés</p>
//                   <p className="company-description">{company.description}</p>
//                   <div className="company-jobs">
//                     {company.jobs} emplois disponibles
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyPage;
// '@ | Out-File -FilePath "src\pages\CompanyPage.js" -Encoding UTF8

// # Créer JobCard.js
// @' 
// import React from 'react';

// const JobCard = ({ job }) => {
//   return (
//     <div className="job-card">
//       <div className="job-header">
//         <h3 className="job-title">{job.title}</h3>
//         <span className="job-type">{job.type}</span>
//       </div>
      
//       <div className="job-company">
//         <strong>{job.company}</strong>
//       </div>
      
//       <div className="job-location">
//         📍 {job.location}
//       </div>
      
//       <div className="job-salary">
//         💰 {job.salary}€/an
//       </div>
      
//       <div className="job-description">
//         {job.description}
//       </div>
      
//       <div className="job-requirements">
//         <strong>Compétences requises:</strong>
//         <div className="requirements-list">
//           {job.requirements.map((req, index) => (
//             <span key={index} className="requirement-tag">{req}</span>
//           ))}
//         </div>
//       </div>
      
//       <div className="job-actions">
//         <button className="btn btn-primary">
//           Postuler
//         </button>
//         <button className="btn btn-secondary">
//           Sauvegarder
//         </button>
//       </div>
//     </div>
//   );
// };

// export default JobCard;
// '@ | Out-File -FilePath "src\pages\JobCardPage.js" -Encoding UTF8

// # Créer JobFilters.js
// @' 
// import React from 'react';

// const JobFilters = ({ filters, onFilterChange }) => {
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     onFilterChange({
//       ...filters,
//       [name]: value
//     });
//   };

//   return (
//     <div className="job-filters">
//       <div className="filter-group">
//         <input
//           type="text"
//           name="search"
//           placeholder="Rechercher un emploi..."
//           value={filters.search}
//           onChange={handleChange}
//           className="filter-input"
//         />
//       </div>
      
//       <div className="filter-group">
//         <select
//           name="location"
//           value={filters.location}
//           onChange={handleChange}
//           className="filter-select"
//         >
//           <option value="">Toutes les villes</option>
//           <option value="Paris">Paris</option>
//           <option value="Lyon">Lyon</option>
//           <option value="Marseille">Marseille</option>
//         </select>
//       </div>
      
//       <div className="filter-group">
//         <select
//           name="category"
//           value={filters.category}
//           onChange={handleChange}
//           className="filter-select"
//         >
//           <option value="">Toutes les catégories</option>
//           <option value="tech">Technologie</option>
//           <option value="design">Design</option>
//           <option value="management">Management</option>
//         </select>
//       </div>
      
//       <div className="filter-group">
//         <select
//           name="type"
//           value={filters.type}
//           onChange={handleChange}
//           className="filter-select"
//         >
//           <option value="">Tous les types</option>
//           <option value="CDI">CDI</option>
//           <option value="CDD">CDD</option>
//           <option value="Freelance">Freelance</option>
//         </select>
//       </div>
//     </div>
//   );
// };

// export default JobFilters;
// '@ | Out-File -FilePath "src\pages\JobFiltersPage.js" -Encoding UTF8

// # Créer DashboardStats.js
// @' 
// import React from 'react';

// const DashboardStats = () => {
//   const stats = [
//     {
//       title: 'Candidatures envoyées',
//       value: 12,
//       icon: '📝',
//       color: 'blue'
//     },
//     {
//       title: 'Entretiens programmés',
//       value: 3,
//       icon: '🗣️',
//       color: 'green'
//     },
//     {
//       title: 'Réponses reçues',
//       value: 8,
//       icon: '📧',
//       color: 'purple'
//     },
//     {
//       title: 'Offres sauvegardées',
//       value: 15,
//       icon: '❤️',
//       color: 'red'
//     }
//   ];

//   return (
//     <div className="dashboard-stats">
//       <div className="stats-grid">
//         {stats.map((stat, index) => (
//           <div key={index} className={`stat-card ${stat.color}`}>
//             <div className="stat-icon">{stat.icon}</div>
//             <div className="stat-info">
//               <h3>{stat.value}</h3>
//               <p>{stat.title}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DashboardStats;
// '@ | Out-File -FilePath "src\pages\DashboardStatsPage.js" -Encoding UTF8

// # Créer RecentApplications.js
// @' 
// import React from 'react';

// const RecentApplications = () => {
//   const applications = [
//     {
//       id: 1,
//       jobTitle: 'Développeur Full Stack',
//       company: 'TechCorp',
//       status: 'En cours',
//       date: '2024-01-15'
//     },
//     {
//       id: 2,
//       jobTitle: 'UX/UI Designer',
//       company: 'Design Studio',
//       status: 'Entretien',
//       date: '2024-01-14'
//     },
//     {
//       id: 3,
//       jobTitle: 'Chef de Projet',
//       company: 'Digital Agency',
//       status: 'Refusé',
//       date: '2024-01-13'
//     }
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'En cours': return 'orange';
//       case 'Entretien': return 'blue';
//       case 'Accepté': return 'green';
//       case 'Refusé': return 'red';
//       default: return 'gray';
//     }
//   };

//   return (
//     <div className="recent-applications">
//       <h2>Candidatures récentes</h2>
//       <div className="applications-list">
//         {applications.map(app => (
//           <div key={app.id} className="application-item">
//             <div className="application-info">
//               <h4>{app.jobTitle}</h4>
//               <p>{app.company}</p>
//               <span className="application-date">{app.date}</span>
//             </div>
//             <div className={`application-status ${getStatusColor(app.status)}`}>
//               {app.status}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RecentApplications;
// '@ | Out-File -FilePath "src\pages\RecentApplicationsPage.js" -Encoding UTF8

// # Créer QuickActions.js
// @' 
// import React from 'react';
// import { Link } from 'react-router-dom';

// const QuickActions = () => {
//   const actions = [
//     {
//       title: 'Parcourir les emplois',
//       description: 'Découvrez de nouvelles opportunités',
//       link: '/jobs',
//       icon: '🔍',
//       color: 'blue'
//     },
//     {
//       title: 'Mettre à jour mon profil',
//       description: 'Gardez vos informations à jour',
//       link: '/profile',
//       icon: '👤',
//       color: 'green'
//     },
//     {
//       title: 'Voir les entreprises',
//       description: 'Explorez nos partenaires',
//       link: '/company',
//       icon: '🏢',
//       color: 'purple'
//     }
//   ];

//   return (
//     <div className="quick-actions">
//       <h2>Actions rapides</h2>
//       <div className="actions-grid">
//         {actions.map((action, index) => (
//           <Link key={index} to={action.link} className={`action-card ${action.color}`}>
//             <div className="action-icon">{action.icon}</div>
//             <div className="action-info">
//               <h4>{action.title}</h4>
//               <p>{action.description}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default QuickActions;
// '@ | Out-File -FilePath "src\pages\QuickActionsPage.js" -Encoding UTF8

// # Créer les fichiers CSS manquants
// @' 
// .auth-page {
//   min-height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// }

// .auth-container {
//   background: white;
//   border-radius: 20px;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//   padding: 3rem;
//   max-width: 400px;
//   width: 100%;
// }

// .auth-form h2 {
//   text-align: center;
//   color: #333;
//   margin-bottom: 0.5rem;
// }

// .auth-form p {
//   text-align: center;
//   color: #666;
//   margin-bottom: 2rem;
// }

// .form-group {
//   margin-bottom: 1.5rem;
// }

// .form-group label {
//   display: block;
//   margin-bottom: 0.5rem;
//   color: #333;
//   font-weight: 500;
// }

// .form-group input,
// .form-group select {
//   width: 100%;
//   padding: 0.75rem;
//   border: 2px solid #e1e5e9;
//   border-radius: 8px;
//   font-size: 1rem;
//   transition: border-color 0.3s ease;
// }

// .form-group input:focus,
// .form-group select:focus {
//   outline: none;
//   border-color: #667eea;
// }

// .btn {
//   width: 100%;
//   padding: 1rem;
//   border: none;
//   border-radius: 8px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .btn-primary {
//   background: linear-gradient(45deg, #667eea, #764ba2);
//   color: white;
// }

// .btn-primary:hover {
//   transform: translateY(-2px);
//   box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
// }

// .btn-primary:disabled {
//   opacity: 0.6;
//   cursor: not-allowed;
//   transform: none;
// }

// .auth-link {
//   text-align: center;
//   margin-top: 1.5rem;
//   color: #666;
// }

// .auth-link a {
//   color: #667eea;
//   text-decoration: none;
//   font-weight: 500;
// }

// .auth-link a:hover {
//   text-decoration: underline;
// }
// '@ | Out-File -FilePath "src\styles\pages\AuthPage.css" -Encoding UTF8

// @' 
// .jobs-page {
//   min-height: 100vh;
//   background: #f8fafc;
// }

// .jobs-container {
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 8rem 2rem 2rem;
// }

// .jobs-header {
//   text-align: center;
//   margin-bottom: 3rem;
// }

// .jobs-header h1 {
//   font-size: 2.5rem;
//   color: #1e293b;
//   margin-bottom: 1rem;
// }

// .jobs-header p {
//   font-size: 1.2rem;
//   color: #64748b;
// }

// .job-filters {
//   display: flex;
//   gap: 1rem;
//   margin-bottom: 2rem;
//   flex-wrap: wrap;
// }

// .filter-group {
//   flex: 1;
//   min-width: 200px;
// }

// .filter-input,
// .filter-select {
//   width: 100%;
//   padding: 0.75rem;
//   border: 2px solid #e2e8f0;
//   border-radius: 8px;
//   font-size: 1rem;
// }

// .filter-input:focus,
// .filter-select:focus {
//   outline: none;
//   border-color: #4f46e5;
// }

// .jobs-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
//   gap: 2rem;
// }

// .job-card {
//   background: white;
//   border-radius: 16px;
//   padding: 2rem;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
//   transition: transform 0.3s ease;
// }

// .job-card:hover {
//   transform: translateY(-5px);
// }

// .job-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: flex-start;
//   margin-bottom: 1rem;
// }

// .job-title {
//   font-size: 1.25rem;
//   color: #1e293b;
//   margin: 0;
// }

// .job-type {
//   background: #e0e7ff;
//   color: #4f46e5;
//   padding: 0.25rem 0.75rem;
//   border-radius: 20px;
//   font-size: 0.875rem;
//   font-weight: 500;
// }

// .job-company {
//   color: #64748b;
//   margin-bottom: 0.5rem;
// }

// .job-location,
// .job-salary {
//   color: #64748b;
//   margin-bottom: 0.5rem;
// }

// .job-description {
//   color: #374151;
//   margin: 1rem 0;
// }

// .requirements-list {
//   display: flex;
//   flex-wrap: wrap;
//   gap: 0.5rem;
//   margin-top: 0.5rem;
// }

// .requirement-tag {
//   background: #f1f5f9;
//   color: #475569;
//   padding: 0.25rem 0.75rem;
//   border-radius: 20px;
//   font-size: 0.875rem;
// }

// .job-actions {
//   display: flex;
//   gap: 1rem;
//   margin-top: 1.5rem;
// }

// .job-actions .btn {
//   flex: 1;
//   padding: 0.75rem 1.5rem;
//   border: none;
//   border-radius: 8px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .job-actions .btn-primary {
//   background: #4f46e5;
//   color: white;
// }

// .job-actions .btn-secondary {
//   background: #f8fafc;
//   color: #4f46e5;
//   border: 2px solid #e2e8f0;
// }

// .loading {
//   text-align: center;
//   padding: 4rem;
//   color: #64748b;
// }
// '@ | Out-File -FilePath "src\styles\pages\JobsPage.css" -Encoding UTF8

// @' 
// .dashboard-page {
//   min-height: 100vh;
//   background: #f8fafc;
// }

// .dashboard-container {
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 8rem 2rem 2rem;
// }

// .dashboard-header {
//   margin-bottom: 3rem;
// }

// .dashboard-header h1 {
//   font-size: 2.5rem;
//   color: #1e293b;
//   margin-bottom: 0.5rem;
// }

// .dashboard-header p {
//   font-size: 1.2rem;
//   color: #64748b;
// }

// .dashboard-stats {
//   margin-bottom: 3rem;
// }

// .stats-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//   gap: 2rem;
// }

// .stat-card {
//   background: white;
//   border-radius: 16px;
//   padding: 2rem;
//   display: flex;
//   align-items: center;
//   gap: 1.5rem;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
// }

// .stat-icon {
//   font-size: 2.5rem;
//   width: 60px;
//   height: 60px;
//   border-radius: 12px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

// .stat-card.blue .stat-icon {
//   background: #e0e7ff;
// }

// .stat-card.green .stat-icon {
//   background: #d1fae5;
// }

// .stat-card.purple .stat-icon {
//   background: #ede9fe;
// }

// .stat-card.red .stat-icon {
//   background: #fecaca;
// }

// .stat-info h3 {
//   font-size: 2rem;
//   color: #1e293b;
//   margin: 0;
// }

// .stat-info p {
//   color: #64748b;
//   margin: 0;
// }

// .dashboard-grid {
//   display: grid;
//   grid-template-columns: 2fr 1fr;
//   gap: 2rem;
// }

// .recent-applications,
// .quick-actions {
//   background: white;
//   border-radius: 16px;
//   padding: 2rem;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
// }

// .recent-applications h2,
// .quick-actions h2 {
//   color: #1e293b;
//   margin-bottom: 1.5rem;
// }

// .applications-list {
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// }

// .application-item {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 1rem;
//   background: #f8fafc;
//   border-radius: 8px;
// }

// .application-info h4 {
//   margin: 0 0 0.25rem 0;
//   color: #1e293b;
// }

// .application-info p {
//   margin: 0;
//   color: #64748b;
// }

// .application-date {
//   font-size: 0.875rem;
//   color: #9ca3af;
// }

// .application-status {
//   padding: 0.25rem 0.75rem;
//   border-radius: 20px;
//   font-size: 0.875rem;
//   font-weight: 500;
// }

// .application-status.orange {
//   background: #fef3c7;
//   color: #d97706;
// }

// .application-status.blue {
//   background: #dbeafe;
//   color: #2563eb;
// }

// .application-status.green {
//   background: #d1fae5;
//   color: #059669;
// }

// .application-status.red {
//   background: #fecaca;
//   color: #dc2626;
// }

// .actions-grid {
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// }

// .action-card {
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   padding: 1rem;
//   background: #f8fafc;
//   border-radius: 8px;
//   text-decoration: none;
//   transition: all 0.3s ease;
// }

// .action-card:hover {
//   transform: translateY(-2px);
//   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
// }

// .action-icon {
//   font-size: 1.5rem;
//   width: 40px;
//   height: 40px;
//   border-radius: 8px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

// .action-card.blue .action-icon {
//   background: #e0e7ff;
// }

// .action-card.green .action-icon {
//   background: #d1fae5;
// }

// .action-card.purple .action-icon {
//   background: #ede9fe;
// }

// .action-info h4 {
//   margin: 0 0 0.25rem 0;
//   color: #1e293b;
// }

// .action-info p {
//   margin: 0;
//   color: #64748b;
//   font-size: 0.875rem;
// }

// @media (max-width: 768px) {
//   .dashboard-grid {
//     grid-template-columns: 1fr;
//   }
  
//   .stats-grid {
//     grid-template-columns: 1fr;
//   }
// }
// '@ | Out-File -FilePath "src\styles\pages\DashboardPage.css" -Encoding UTF8

// cat > src/styles/pages/HomePage.css << 'EOF'
// /* HomePage specific styles are already in globals.css */
// EOF

// # Créer une image placeholder
// cat > src/assets/images/pers3.png << 'EOF'
// # Placeholder pour l'image - vous devrez remplacer ceci par une vraie image
// EOF

// # Corriger globals.css pour enlever la référence à l'image manquante
// sed -i 's|url('\''./image/burreau.png'\'')|linear-gradient(135deg, rgba(30, 58, 138, 0.8) 0%, rgba(79, 70, 229, 0.7) 100%)|g' src/styles/globals.css

// echo "Tous les fichiers ont été créés et corrigés !"
// echo "N'oubliez pas d'installer les dépendances manquantes avec :"
// echo "npm install react-redux @reduxjs/toolkit react-hot-toast"