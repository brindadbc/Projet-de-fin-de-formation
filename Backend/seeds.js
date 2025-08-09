// const { MongoClient } = require('mongodb');

// // Configuration de la base de données
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtracks '
// const DATABASE_NAME = process.env.DATABASE_NAME || 'job_board';
// const COLLECTION_NAME = 'jobs';

// // Données de seeds pour les offres d'emploi
// const jobSeeds = [
//   {
//     title: 'Développeur React Senior',
//     company: 'TechCorp Cameroun',
//     location: 'Yaoundé, Cameroun',
//     type: 'CDI',
//     remote: true,
//     salary: {
//       min: '800000',
//       max: '1200000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'senior',
//     education: 'Bac+5 en informatique ou équivalent',
//     description: 'Nous recherchons un développeur React Senior pour rejoindre notre équipe dynamique. Vous serez responsable du développement de nos applications web modernes en utilisant les dernières technologies React. Une excellente opportunité de travailler sur des projets innovants dans un environnement technologique de pointe.',
//     requirements: [
//       'Minimum 5 ans d\'expérience en développement React',
//       'Maîtrise de JavaScript ES6+, TypeScript',
//       'Connaissance des hooks et du state management (Redux, Context API)',
//       'Expérience avec les tests unitaires (Jest, React Testing Library)',
//       'Maîtrise de Git et des workflows collaboratifs'
//     ],
//     benefits: [
//       'Télétravail hybride',
//       'Formation continue',
//       'Assurance santé complète',
//       'Bonus de performance',
//       'Congés payés étendus'
//     ],
//     skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Node.js', 'Git', 'Jest'],
//     department: 'Développement',
//     team_size: '8-12 personnes',
//     start_date: '2025-09-01',
//     application_deadline: '2025-08-15',
//     contact_email: 'recrutement@techcorp.cm',
//     questions: [
//       'Parlez-nous de votre expérience avec React et les projets sur lesquels vous avez travaillé',
//       'Comment gérez-vous l\'optimisation des performances dans une application React ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Chef de Projet Digital',
//     company: 'Digital Solutions Africa',
//     location: 'Douala, Cameroun',
//     type: 'CDI',
//     remote: false,
//     salary: {
//       min: '600000',
//       max: '900000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'intermediate',
//     education: 'Master en gestion de projet ou équivalent',
//     description: 'Rejoignez notre équipe en tant que Chef de Projet Digital ! Vous piloterez des projets digitaux innovants pour nos clients en Afrique centrale. Poste idéal pour quelqu\'un qui aime les défis et souhaite avoir un impact significatif sur la transformation digitale en Afrique.',
//     requirements: [
//       'Expérience de 3-5 ans en gestion de projets digitaux',
//       'Certification PMP ou équivalent appréciée',
//       'Maîtrise des outils de gestion de projet (Jira, Trello, Asana)',
//       'Excellentes compétences en communication',
//       'Bilingue français-anglais'
//     ],
//     benefits: [
//       'Véhicule de fonction',
//       'Formations certifiantes',
//       'Prime de résultats',
//       'Mutuelle famille',
//       'Opportunités de mission à l\'étranger'
//     ],
//     skills: ['Gestion de projet', 'Scrum', 'Agile', 'JIRA', 'Leadership', 'Communication'],
//     department: 'Management',
//     team_size: '5-8 personnes',
//     start_date: '2025-08-15',
//     application_deadline: '2025-08-01',
//     contact_email: 'careers@digitalsolutions.cm',
//     questions: [
//       'Décrivez un projet complexe que vous avez géré du début à la fin',
//       'Comment gérez-vous les conflits au sein d\'une équipe projet ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Data Scientist Junior',
//     company: 'AI Innovations Lab',
//     location: 'Yaoundé, Cameroun',
//     type: 'CDI',
//     remote: true,
//     salary: {
//       min: '500000',
//       max: '700000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'junior',
//     education: 'Master en Data Science, Statistiques ou Informatique',
//     description: 'Opportunité unique pour un Data Scientist débutant de rejoindre notre laboratoire d\'innovation en IA. Vous travaillerez sur des projets passionnants d\'analyse de données et de machine learning pour des clients dans différents secteurs.',
//     requirements: [
//       'Diplôme en Data Science, Mathématiques ou domaine connexe',
//       'Connaissance de Python et des bibliothèques ML (pandas, scikit-learn)',
//       'Bases en statistiques et probabilités',
//       'Expérience avec SQL et bases de données',
//       'Anglais technique requis'
//     ],
//     benefits: [
//       'Mentorat par des experts',
//       'Accès aux dernières technologies IA',
//       'Formation continue',
//       'Flexible working hours',
//       'Projet de recherche personnel'
//     ],
//     skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Scikit-learn', 'Statistics', 'Data Visualization'],
//     department: 'Research & Development',
//     team_size: '6-10 personnes',
//     start_date: '2025-09-15',
//     application_deadline: '2025-08-30',
//     contact_email: 'jobs@ailab.cm',
//     questions: [
//       'Quel projet de data science vous a le plus marqué pendant vos études ?',
//       'Comment abordez-vous l\'analyse d\'un nouveau dataset ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Designer UX/UI',
//     company: 'Creative Studio CM',
//     location: 'Douala, Cameroun',
//     type: 'Freelance',
//     remote: true,
//     salary: {
//       min: '15000',
//       max: '25000',
//       currency: 'FCFA',
//       period: 'day'
//     },
//     experience: 'intermediate',
//     education: 'Formation en design graphique ou équivalent',
//     description: 'Nous recherchons un Designer UX/UI talentueux pour des missions freelance sur nos projets clients. Vous concevrez des interfaces utilisateur intuitives et esthétiques pour des applications web et mobile.',
//     requirements: [
//       'Portfolio démontrant vos compétences UX/UI',
//       'Maîtrise de Figma, Adobe Creative Suite',
//       'Expérience en design d\'interfaces web et mobile',
//       'Connaissance des principes d\'accessibilité',
//       'Capacité à travailler en autonomie'
//     ],
//     benefits: [
//       'Flexibilité totale',
//       'Projets variés et stimulants',
//       'Possibilité de CDI selon performance',
//       'Collaboration avec équipe créative',
//       'Rémunération attractive'
//     ],
//     skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Prototyping', 'User Research'],
//     department: 'Design',
//     team_size: '3-5 personnes',
//     start_date: '2025-08-01',
//     application_deadline: '2025-07-25',
//     contact_email: 'design@creativestudio.cm',
//     questions: [
//       'Présentez-nous votre projet de design le plus abouti',
//       'Comment procédez-vous pour comprendre les besoins utilisateur ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Développeur Backend Node.js',
//     company: 'Fintech Cameroun',
//     location: 'Yaoundé, Cameroun',
//     type: 'CDI',
//     remote: false,
//     salary: {
//       min: '700000',
//       max: '1000000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'intermediate',
//     education: 'Licence en informatique minimum',
//     description: 'Rejoignez notre équipe backend pour développer des solutions fintech innovantes. Vous travaillerez sur des API robustes et sécurisées qui supportent nos services de paiement mobile et bancaires.',
//     requirements: [
//       'Expérience solide avec Node.js et Express',
//       'Maîtrise des bases de données (MongoDB, PostgreSQL)',
//       'Connaissance des API REST et GraphQL',
//       'Expérience avec les microservices',
//       'Sensibilité aux aspects sécurité et performance'
//     ],
//     benefits: [
//       'Secteur fintech en pleine croissance',
//       'Stock options',
//       'Formation blockchain et crypto',
//       'Équipe technique de haut niveau',
//       'Projets à impact social'
//     ],
//     skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API', 'GraphQL', 'Docker'],
//     department: 'Engineering',
//     team_size: '10-15 personnes',
//     start_date: '2025-08-20',
//     application_deadline: '2025-08-10',
//     contact_email: 'tech@fintech.cm',
//     questions: [
//       'Décrivez votre expérience avec les architectures microservices',
//       'Comment assurez-vous la sécurité d\'une API de paiement ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Stagiaire Marketing Digital',
//     company: 'Growth Agency',
//     location: 'Douala, Cameroun',
//     type: 'Stage',
//     remote: false,
//     salary: {
//       min: '150000',
//       max: '200000',
//       currency: 'FCFA',
//       period: 'month'
//     },
//     experience: 'junior',
//     education: 'Étudiant en Marketing, Communication ou équivalent',
//     description: 'Stage de 6 mois dans une agence marketing digital dynamique. Vous découvrirez tous les aspects du marketing digital : SEO, réseaux sociaux, publicité en ligne, analytics.',
//     requirements: [
//       'Étudiant en dernière année (Bac+3/4/5)',
//       'Passion pour le marketing digital',
//       'Maîtrise des réseaux sociaux',
//       'Bon niveau rédactionnel',
//       'Créativité et esprit d\'initiative'
//     ],
//     benefits: [
//       'Formation complète au marketing digital',
//       'Encadrement personnalisé',
//       'Possibilité d\'embauche à l\'issue du stage',
//       'Projets clients réels',
//       'Certificat de stage valorisant'
//     ],
//     skills: ['Social Media', 'SEO', 'Google Analytics', 'Content Marketing', 'Canva'],
//     department: 'Marketing',
//     team_size: '4-6 personnes',
//     start_date: '2025-09-01',
//     application_deadline: '2025-08-15',
//     contact_email: 'stage@growthagency.cm',
//     questions: [
//       'Quelle campagne marketing récente vous a le plus impressionné et pourquoi ?',
//       'Comment mesureriez-vous le succès d\'une campagne social media ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Ingénieur DevOps',
//     company: 'CloudTech Solutions',
//     location: 'Yaoundé, Cameroun',
//     type: 'CDI',
//     remote: true,
//     salary: {
//       min: '900000',
//       max: '1300000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'senior',
//     education: 'Ingénieur en informatique ou équivalent',
//     description: 'Poste d\'Ingénieur DevOps pour optimiser nos infrastructures cloud et automatiser nos processus de déploiement. Vous jouerez un rôle clé dans la transformation digitale de nos clients.',
//     requirements: [
//       'Expérience avec AWS, Azure ou GCP',
//       'Maîtrise de Docker et Kubernetes',
//       'Connaissance des outils CI/CD (Jenkins, GitLab CI)',
//       'Scripting (Bash, Python, Terraform)',
//       'Expérience en monitoring et observabilité'
//     ],
//     benefits: [
//       'Certifications cloud prises en charge',
//       'Télétravail full remote possible',
//       'Matériel haut de gamme fourni',
//       'Participation aux conférences tech',
//       'Évolution vers Lead DevOps'
//     ],
//     skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Monitoring'],
//     department: 'Infrastructure',
//     team_size: '6-8 personnes',
//     start_date: '2025-08-15',
//     application_deadline: '2025-08-05',
//     contact_email: 'devops@cloudtech.cm',
//     questions: [
//       'Décrivez votre expérience avec l\'orchestration de conteneurs',
//       'Comment abordez-vous le monitoring d\'une infrastructure cloud ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     title: 'Développeur Mobile Flutter',
//     company: 'MobileFirst Cameroun',
//     location: 'Douala, Cameroun',
//     type: 'CDD',
//     remote: false,
//     salary: {
//       min: '600000',
//       max: '800000',
//       currency: 'FCFA',
//       period: 'year'
//     },
//     experience: 'intermediate',
//     education: 'Formation en développement informatique',
//     description: 'CDD de 12 mois pour développer une application mobile innovante dans le secteur de la santé. Vous travaillerez avec Flutter pour créer une expérience utilisateur exceptionnelle.',
//     requirements: [
//       'Expérience de 2+ ans avec Flutter et Dart',
//       'Connaissance des API REST et intégration',
//       'Expérience avec les stores (Google Play, App Store)',
//       'Maîtrise de Git et des bonnes pratiques',
//       'Sensibilité UX et design'
//     ],
//     benefits: [
//       'Projet innovant dans la e-santé',
//       'Équipe jeune et dynamique',
//       'Possibilité de CDI selon résultats',
//       'Formation continue',
//       'Flexible hours'
//     ],
//     skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git', 'Mobile Development'],
//     department: 'Mobile',
//     team_size: '4-6 personnes',
//     start_date: '2025-08-01',
//     application_deadline: '2025-07-20',
//     contact_email: 'mobile@mobilefirst.cm',
//     questions: [
//       'Montrez-nous une application Flutter que vous avez développée',
//       'Comment optimisez-vous les performances d\'une app Flutter ?'
//     ],
//     status: 'Actif',
//     createdAt: new Date(),
//     updatedAt: new Date()
//   }
// ];

// // Fonction pour se connecter à MongoDB
// async function connectToDatabase() {
//   const client = new MongoClient(MONGODB_URI);
//   await client.connect();
//   console.log('✅ Connexion à MongoDB établie');
//   return client.db(DATABASE_NAME);
// }

// // Fonction pour insérer les seeds
// async function seedJobs() {
//   let client;
  
//   try {
//     client = new MongoClient(MONGODB_URI);
//     await client.connect();
    
//     const db = client.db(DATABASE_NAME);
//     const collection = db.collection(COLLECTION_NAME);
    
//     // Vérifier si des offres existent déjà
//     const existingJobs = await collection.countDocuments();
    
//     if (existingJobs > 0) {
//       console.log(`⚠️  ${existingJobs} offres d'emploi trouvées dans la base de données.`);
//       console.log('Voulez-vous continuer ? Cela ajoutera de nouvelles offres. (Ctrl+C pour annuler)');
      
//       // Attendre 3 secondes avant de continuer
//       await new Promise(resolve => setTimeout(resolve, 3000));
//     }
    
//     // Insérer les nouvelles offres
//     const result = await collection.insertMany(jobSeeds);
//     console.log(`✅ ${result.insertedCount} offres d'emploi insérées avec succès !`);
    
//     // Afficher un résumé
//     console.log('\n📊 Résumé des offres créées :');
//     jobSeeds.forEach((job, index) => {
//       console.log(`${index + 1}. ${job.title} - ${job.company} (${job.type})`);
//     });
    
//     console.log(`\n🎉 Seeds terminées ! Total d'offres dans la base : ${existingJobs + result.insertedCount}`);
    
//   } catch (error) {
//     console.error('❌ Erreur lors de l\'insertion des seeds :', error);
//   } finally {
//     if (client) {
//       await client.close();
//       console.log('🔐 Connexion MongoDB fermée');
//     }
//   }
// }

// // Fonction pour nettoyer la collection (optionnel)
// async function clearJobs() {
//   let client;
  
//   try {
//     client = new MongoClient(MONGODB_URI);
//     await client.connect();
    
//     const db = client.db(DATABASE_NAME);
//     const collection = db.collection(COLLECTION_NAME);
    
//     const result = await collection.deleteMany({});
//     console.log(`🗑️  ${result.deletedCount} offres supprimées`);
    
//   } catch (error) {
//     console.error('❌ Erreur lors de la suppression :', error);
//   } finally {
//     if (client) {
//       await client.close();
//     }
//   }
// }

// // Script principal
// async function main() {
//   const args = process.argv.slice(2);
  
//   if (args.includes('--clear')) {
//     console.log('🗑️  Suppression de toutes les offres...');
//     await clearJobs();
//     return;
//   }
  
//   if (args.includes('--help')) {
//     console.log(`
// 📝 Script de seeds pour offres d'emploi

// Usage:
//   node seeds.js              # Insérer les offres de test
//   node seeds.js --clear      # Supprimer toutes les offres
//   node seeds.js --help       # Afficher cette aide

// Variables d'environnement:
//   MONGODB_URI               # URI de connexion MongoDB (défaut: mongodb://localhost:27017)
//   DATABASE_NAME             # Nom de la base de données (défaut: job_board)
//     `);
//     return;
//   }
  
//   console.log('🌱 Lancement des seeds pour les offres d\'emploi...');
//   await seedJobs();
// }

// // Exécuter le script
// if (require.main === module) {
//   main().catch(console.error);
// }

// module.exports = { seedJobs, clearJobs, jobSeeds };