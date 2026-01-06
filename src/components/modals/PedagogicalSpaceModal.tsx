import React, { useEffect, useMemo, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { addPedagogicalSpace, getAllPromotions, getAllUsers } from '@/lib/db';
import type { PedagogicalSpace, Promotion, User } from '@/lib/db';
import { getPromotions, getUsers } from '@/lib/api';

interface PedagogicalSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (space: PedagogicalSpace) => void;
}

export const PedagogicalSpaceModal: React.FC<PedagogicalSpaceModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', formateurId: '', studentId: '', promotionId: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingRefs(true);
        // Charger en parallèle avec fallback rapide (timeouts gérés par api.ts)
        const [usrRes, promoRes] = await Promise.allSettled([getUsers(), getPromotions()]);

        if (usrRes.status === 'fulfilled' && Array.isArray(usrRes.value)) {
          const normalizedUsers: User[] = usrRes.value
            .map((u: any) => ({
              id: String(u._id ?? u.id ?? ''),
              name: u.name,
              email: u.email,
              role: u.role,
              status: (u.status ?? 'active') as User['status'],
              createdOn: u.createdOn ?? new Date().toLocaleDateString('fr-FR'),
              phone: u.phone,
              promotion: u.promotion,
            }))
            .filter((u: User) => !!u.id);
          setUsers(normalizedUsers);
        } else {
          setUsers(await getAllUsers());
        }

        if (promoRes.status === 'fulfilled' && Array.isArray(promoRes.value)) {
          const normalizedPromos: Promotion[] = promoRes.value
            .map((p: any) => ({
              id: String(p._id ?? p.id ?? ''),
              academicYear: String(p.academicYear ?? p.year ?? ''),
              label: p.label,
              students: Number(p.students ?? 0),
              spaces: Number(p.spaces ?? 0),
            }))
            .filter((p: any) => !!p.id) as Promotion[];
          setPromotions(normalizedPromos);
        } else {
          setPromotions(await getAllPromotions());
        }
      } catch (e) {
        console.error('Failed loading data', e);
      } finally {
        setLoadingRefs(false);
      }
    }
    if (isOpen) loadData();
  }, [isOpen]);

  const formateurs = useMemo(() => users.filter(u => u.role === 'formateur'), [users]);
  const etudiants = useMemo(() => users.filter(u => u.role === 'etudiant'), [users]);

  const selectedFormateur = useMemo(() => users.find(u => u.id === formData.formateurId), [users, formData.formateurId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.formateurId || !formData.promotionId || !formData.studentId) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir toutes les sélections.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Pas d’API dédiée côté back pour l’instant — on enregistre localement
      const space: PedagogicalSpace = {
        id: uuidv4(),
        name: formData.name,
        formateur: selectedFormateur?.name || '',
        formateurId: formData.formateurId,
        promotion: formData.promotionId,
        studentId: formData.studentId,
        students: 1, // on commence avec un étudiant sélectionné
        createdOn: new Date().toLocaleDateString('fr-FR'),
      };
      await addPedagogicalSpace(space);

      toast({ title: 'Espace créé', description: 'L’espace pédagogique a été ajouté.' });
      setFormData({ name: '', formateurId: '', studentId: '', promotionId: '' });
      onCreated?.(space);
      onClose();
    } catch (error) {
      console.error('Failed to create pedagogical space:', error);
      toast({ title: 'Erreur', description: "Impossible de créer l’espace pédagogique.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle>Créer un espace pédagogique</DialogTitle>
          <DialogDescription className="text-gray-600">Sélectionnez le formateur, l’étudiant, la promotion et la matière.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Matière</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Programmation Web" required />
            </div>

            <div className="space-y-2">
              <Label>Formateur</Label>
              <Select value={formData.formateurId} onValueChange={(v) => setFormData({ ...formData, formateurId: v })} disabled={loadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un formateur" />
                </SelectTrigger>
                <SelectContent>
                  {formateurs.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Étudiant</Label>
              <Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })} disabled={loadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un étudiant" />
                </SelectTrigger>
                <SelectContent>
                  {etudiants.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Promotion</Label>
              <Select value={formData.promotionId} onValueChange={(v) => setFormData({ ...formData, promotionId: v })} disabled={loadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label ?? `Promotion ${p.academicYear}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || loadingRefs} className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
              {loading || loadingRefs ? 'Chargement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PedagogicalSpaceModal;
