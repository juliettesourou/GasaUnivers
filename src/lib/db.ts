import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'directeur' | 'formateur' | 'etudiant';
  status: 'active' | 'inactive';
  createdOn: string;
  password?: string;
  promotion?: string;
  phone?: string;
}

export interface Promotion {
  id: string;
  year: string;
  students: number;
  spaces: number;
  label?: string;
}

export interface PedagogicalSpace {
  id: string;
  name: string;
  formateur: string;
  formateurId: string;
  promotion: string;
  studentId?: string;
  students: number;
  description?: string;
  createdOn: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  spaceId: string;
  enrolledOn: string;
}

interface UniversityCasaDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string; 'by-role': string };
  };
  promotions: {
    key: string;
    value: Promotion;
    indexes: { 'by-year': string };
  };
  pedagogicalSpaces: {
    key: string;
    value: PedagogicalSpace;
    indexes: { 'by-formateur': string; 'by-promotion': string };
  };
  enrollments: {
    key: string;
    value: Enrollment;
    indexes: { 'by-student': string; 'by-space': string };
  };
}

const DB_NAME = 'universite-casa-db';
// Incrémentez la version quand vous ajoutez de nouveaux object stores ou index
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<UniversityCasaDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<UniversityCasaDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<UniversityCasaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
        userStore.createIndex('by-role', 'role');
      }

      // Promotions store
      if (!db.objectStoreNames.contains('promotions')) {
        const promoStore = db.createObjectStore('promotions', { keyPath: 'id' });
        promoStore.createIndex('by-year', 'year');
      }

      // Pedagogical spaces store
      if (!db.objectStoreNames.contains('pedagogicalSpaces')) {
        const spaceStore = db.createObjectStore('pedagogicalSpaces', { keyPath: 'id' });
        spaceStore.createIndex('by-formateur', 'formateurId');
        spaceStore.createIndex('by-promotion', 'promotion');
      }

      // Enrollments store
      if (!db.objectStoreNames.contains('enrollments')) {
        const enrollStore = db.createObjectStore('enrollments', { keyPath: 'id' });
        enrollStore.createIndex('by-student', 'studentId');
        enrollStore.createIndex('by-space', 'spaceId');
      }
    },
  });

  return dbInstance;
}


/** Seed database with initial demo data if empty */
export async function seedDatabase(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['users', 'promotions'], 'readwrite');
  const userStore = tx.objectStore('users');
  const existing = await userStore.getAll();
  if (existing.length === 0) {
    const now = new Date().toLocaleDateString('fr-FR');
    const demoUsers: User[] = [
      {
        id: crypto.randomUUID(),
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        role: 'directeur',
        status: 'active',
        createdOn: now,
        phone: '+212600000001',
      },
      {
        id: crypto.randomUUID(),
        name: 'Alice Martin',
        email: 'alice.martin@example.com',
        role: 'formateur',
        status: 'active',
        createdOn: now,
        phone: '+212600000002',
      },
      {
        id: crypto.randomUUID(),
        name: 'Mohamed El Fassi',
        email: 'mohamed.elfassi@example.com',
        role: 'etudiant',
        status: 'inactive',
        createdOn: now,
        phone: '+212600000003',
      },
    ];
    for (const u of demoUsers) {
      await userStore.add(u);
    }
  }
  // seed promotions if empty
  const promoStore = tx.objectStore('promotions');
  const existingPromos = await promoStore.getAll();
  if (existingPromos.length === 0) {
    const demoPromos: Promotion[] = [
      { id: crypto.randomUUID(), year: '2020', students: 180, spaces: 15 },
      { id: crypto.randomUUID(), year: '2021', students: 210, spaces: 16 },
      { id: crypto.randomUUID(), year: '2022', students: 195, spaces: 14 },
      { id: crypto.randomUUID(), year: '2023', students: 225, spaces: 18 },
      { id: crypto.randomUUID(), year: '2024', students: 246, spaces: 20 },
    ];
    for (const p of demoPromos) {
      await promoStore.add(p);
    }
  }
  await tx.done;
}

export async function getAllUsers(): Promise<User[]> {
  const db = await initDB();
  return db.getAll('users');
}

export async function deleteUser(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('users', id);
}

export async function addUser(user: User): Promise<void> {
  const db = await initDB();
  await db.add('users', user);
}

export async function updateUser(user: User): Promise<void> {
  const db = await initDB();
  await db.put('users', user);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await initDB();
  return db.get('users', id);
}

/** Retourne un utilisateur par email (si existe) */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await initDB();
  try {
    // utilise l'index 'by-email' qui est défini lors de l'upgrade
    return await db.getFromIndex('users', 'by-email', email);
  } catch (e) {
    // en cas de problème, retourner undefined
    console.error('getUserByEmail error', e);
    return undefined;
  }
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const db = await initDB();
  return db.getAll('promotions');
}

export async function addPromotion(promo: Promotion): Promise<void> {
  const db = await initDB();
  await db.add('promotions', promo);
}

export async function getAllPedagogicalSpaces(): Promise<PedagogicalSpace[]> {
  const db = await initDB();
  return db.getAll('pedagogicalSpaces');
}

export async function addPedagogicalSpace(space: PedagogicalSpace): Promise<void> {
  const db = await initDB();
  await db.add('pedagogicalSpaces', space);
}

export async function getSpacesByPromotion(promotionId: string): Promise<PedagogicalSpace[]> {
  const db = await initDB();
  const idx = db.transaction('pedagogicalSpaces').store.index('by-promotion');
  return idx.getAll(promotionId);
}

export async function getSpacesByFormateur(formateurId: string): Promise<PedagogicalSpace[]> {
  const db = await initDB();
  const idx = db.transaction('pedagogicalSpaces').store.index('by-formateur');
  return idx.getAll(formateurId);
}

/** Retourne tous les étudiants inscrits pour une promotion donnée */
export async function getStudentsByPromotion(promotionId: string): Promise<User[]> {
  const db = await initDB();
  const all = await db.getAll('users');
  return all.filter((u) => u.role === 'etudiant' && u.promotion === promotionId);
}
