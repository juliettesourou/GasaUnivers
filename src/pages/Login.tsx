import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/hooks/use-toast';
import { apiLogin } from '@/lib/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useRole();
  const toast = useToast().toast;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function normalizeEmail(raw: string): string {
    // Corriger les erreurs courantes: remplacer ';' ou ',' par '.' et retirer espaces
    return raw.replace(/[;,]+/g, '.').trim().toLowerCase();
  }

  function isValidEmail(e: string): boolean {
    // Regex simple pour email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      toast({ title: 'Email invalide', description: "Veuillez saisir un email valide (ex: jean@exemple.com).", variant: 'destructive' });
      return;
    }
    if (!password) {
      toast({ title: 'Mot de passe requis', description: 'Veuillez saisir votre mot de passe.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiLogin(normalizedEmail, password);
      // save token
      if (res.token) localStorage.setItem('token', res.token);
      const user = res.user || { id: res.id, name: res.name, role: res.role };
      login(user.name || normalizedEmail, user.role || 'etudiant');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      toast({ title: 'Erreur', description: err?.body?.message || 'Email ou mot de passe invalide.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-2 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@exemple.com" required />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Mot de passe</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button type="submit" className="w-full" disabled={submitting || !isValidEmail(normalizeEmail(email)) || !password}>
                {submitting ? 'Connexion…' : 'Se connecter'}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ? <Link to="/register" className="text-primary">Inscrivez-vous</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
