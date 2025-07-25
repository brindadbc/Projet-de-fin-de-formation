const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Charger les variables d'environnement
dotenv.config();

const createAdmin = async () => {
  try {
    // Utiliser la variable d'environnement MONGO_URI
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connexion à MongoDB réussie');
    
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Un admin existe déjà:', adminExists.email);
      return;
    }

    // Créer un nouvel admin (le hachage du mot de passe se fait automatiquement grâce au middleware pre('save'))
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123', // Le mot de passe sera haché automatiquement
      role: 'admin',
      isActive: true
    });

    console.log('Admin créé avec succès:');
    console.log('Email:', admin.email);
    console.log('Nom:', admin.name);
    console.log('Rôle:', admin.role);
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error.message);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion fermée');
    process.exit(0);
  }
};

createAdmin();