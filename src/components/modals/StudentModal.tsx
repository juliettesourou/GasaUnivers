import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addUser, updateUser, getUserById } from '@/lib/db';
import { createUser as apiCreateUser, updateUserApi as apiUpdateUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionId?: string;
  promotionLabel?: string;
  editUserId?: string | null;
  role?: 'etudiant' | 'formateur';
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?';
  const array = new Uint32Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * chars.length);
  }
  return Array.from(array, (n) => chars[n % chars.length]).join('').slice(0, length);
}

export const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, promotionId, promotionLabel, editUserId = null, role = 'etudiant' }) => {
  const toast = useToast().toast;
  const [stage, setStage] = useState<'form' | 'result'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [generatedPwd, setGeneratedPwd] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [createdOnServer, setCreatedOnServer] = useState<boolean | null>(null);

  const loadUser = async (id: string) => {
    try {
      const u = await getUserById(id);
      if (!u) return;
      // split name into first/last naively
      const parts = (u.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      // keep password empty for security; admin may set a new one
    } catch (err) {
      console.error(err);
    }
  };

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();

    if (!email || !validateEmail(email)) {
      toast({ title: 'Erreur', description: "Saisissez un email valide.", variant: 'destructive' });
      return;
    }

    const pwd = password && password.length >= 8 ? password : generatePassword(10);
    if (!password) setGeneratedPwd(pwd);

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || email;

    try {
      if (editing && editUserId) {
        const existing = await getUserById(editUserId);
        if (!existing) throw new Error('Utilisateur introuvable');
        const updated = {
          ...existing,
          name: fullName,
          email,
          phone: phone || undefined,
          // only update promotion when provided (editing student within a promotion)
          promotion: promotionId || existing.promotion,
        } as typeof existing;
        if (password) {
          updated.password = pwd;
        }
        try {
          await apiUpdateUser(editUserId, { name: updated.name, email: updated.email, phone: updated.phone, promotion: updated.promotion });
        } catch (err) {
          await updateUser(updated as any);
        }
      } else {
        const newUser = {
          id: uuidv4(),
          name: fullName,
          email,
          role: role || 'etudiant',
          status: 'active' as const,
          createdOn: new Date().toISOString().split('T')[0],
          password: pwd,
          promotion: role === 'etudiant' ? promotionId : undefined,
          phone: phone || undefined,
        };
        // try backend first (admin endpoint), fallback to local DB
        try {
          await apiCreateUser({ name: newUser.name, email: newUser.email, password: newUser.password, role: newUser.role, phone: newUser.phone, promotion: newUser.promotion });
          setCreatedOnServer(true);
        } catch (err) {
          await addUser(newUser);
          setCreatedOnServer(false);
        }
        try {
          const saved = {
            email,
            password: pwd,
            name: fullName,
            promotionId,
            promotionLabel: promotionLabel || null,
            createdOn: newUser.createdOn,
          };
          localStorage.setItem('lastStudentCredentials', JSON.stringify(saved));
        } catch (storageError) {
          console.warn('localStorage not available', storageError);
        }
      }
      setStage('result');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: "Impossible de créer/mettre à jour l'étudiant.", variant: 'destructive' });
    }
  };

  const handleCopy = async () => {
    const pwd = generatedPwd || password;
    const text = `Email: ${email}\nMot de passe: ${pwd}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copié', description: 'Identifiants copiés dans le presse-papiers.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de copier (presse-papiers non disponible).', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    // reset state
    setStage('form');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setGeneratedPwd(null);
    setEditing(false);
    onClose();
  };

  // when opening in edit mode, load user data
  React.useEffect(() => {
    if (isOpen && editUserId) {
      setEditing(true);
      loadUser(editUserId);
    } else {
      setEditing(false);
    }
  }, [isOpen, editUserId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{editing ? `Modifier un ${role}` : `Ajouter un ${role}`}</DialogTitle>
          <DialogDescription className="text-gray-600">{role === 'etudiant' ? `Promotion: ${promotionLabel || promotionId}` : 'Créer un compte formateur'}</DialogDescription>
        </DialogHeader>

        {stage === 'form' ? (
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Prénom</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="etudiant@exemple.com" required />
              </div>

              <div>
                <Label>Téléphone (optionnel)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2126XXXXXXXX" />
              </div>

              <div>
                <Label>Mot de passe (optionnel — sera généré si vide)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Laisser vide pour générer" />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">{editing ? 'Enregistrer' : `Créer ${role === 'etudiant' ? "l'étudiant" : 'le formateur'}`}</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted rounded">
              <p className="font-medium">{role === 'etudiant' ? 'Étudiant créé' : 'Formateur créé'}</p>
              <p className="text-sm mt-2">Email: <span className="font-medium">{email}</span></p>
              <p className="text-sm">Mot de passe: <span className="font-medium">{generatedPwd || password}</span></p>
              {createdOnServer === false && (
                <p className="text-sm mt-2 text-destructive">Compte créé localement (hors serveur). Pour que l'utilisateur se connecte au serveur, créez-le en étant connecté (token requis).</p>
              )}
              {createdOnServer === true && (
                <p className="text-sm mt-2 text-green-600">Compte créé sur le serveur. L'utilisateur peut se connecter avec ces identifiants.</p>
              )}
              {role === 'etudiant' && (
                <p className="text-sm">Promotion: <span className="font-medium">{promotionLabel || promotionId}</span></p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">Copier les identifiants</Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">Fermer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
