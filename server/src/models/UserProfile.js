/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  
  // Persönliche Daten
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  placeOfBirth: { type: String },
  nationality: { type: String },
  gender: { type: String, enum: ['male', 'female', 'diverse', 'prefer_not_to_say'] },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed', 'partnership'] },
  
  // Kontaktdaten
  personalEmail: { type: String },
  personalPhone: { type: String },
  mobilePhone: { type: String },
  
  // Adresse
  street: { type: String },
  houseNumber: { type: String },
  postalCode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'Deutschland' },
  
  // Notfallkontakt
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  
  // Arbeitgeber-relevante Daten
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String },
  position: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date },
  contractType: { type: String, enum: ['permanent', 'temporary', 'freelance', 'internship', 'apprentice'] },
  workingHours: { type: Number, default: 40 },
  vacationDays: { type: Number, default: 30 },
  
  // Sozialversicherung & Steuer
  socialSecurityNumber: { type: String }, // Sozialversicherungsnummer
  taxId: { type: String }, // Steuer-ID
  taxClass: { type: String, enum: ['1', '2', '3', '4', '5', '6'] },
  healthInsurance: {
    company: { type: String },
    insuranceNumber: { type: String },
    type: { type: String, enum: ['public', 'private'] }
  },
  
  // Bankdaten
  bankAccount: {
    accountHolder: { type: String },
    iban: { type: String },
    bic: { type: String },
    bankName: { type: String }
  },
  
  // Dokumente & Qualifikationen
  documents: [{
    type: { type: String }, // 'contract', 'certificate', 'id', etc.
    name: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    path: { type: String }
  }],
  
  // Zusätzliche Informationen
  disabilities: { type: String },
  notes: { type: String },
  
  // Foto
  profilePhoto: { type: String }
  
}, { timestamps: true });

export default mongoose.model('UserProfile', UserProfileSchema);