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
import { useToast } from '@/hooks/use-toast';
import { addPromotion } from '@/lib/db';
import { createPromotion as apiCreatePromotion } from '@/lib/api';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ label: '', year: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const yearNum = Number(formData.year);
      if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
        toast({ title: 'Erreur', description: "Saisissez une année valide (2000-2100).", variant: 'destructive' });
        return;
      }

      // Tente la création côté backend d'abord
      try {
        await apiCreatePromotion({ label: formData.label, year: yearNum });
      } catch (serverErr) {
        // Fallback local IndexedDB
        const newPromo = {
          id: uuidv4(),
          year: String(yearNum),
          label: formData.label || undefined,
          students: 0,
          spaces: 0,
        };
        await addPromotion(newPromo);
      }

      toast({ title: 'Promotion créée', description: "La promotion a été ajoutée." });
      setFormData({ label: '', year: '' });
      onClose();
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast({ title: 'Erreur', description: "Impossible de créer la promotion.", variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle>Ajouter une promotion</DialogTitle>
          <DialogDescription className="text-gray-600">Créer une nouvelle promotion</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Libellé</Label>
              <Input id="label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Promotion Ingénierie 2026" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Input id="year" type="number" min={2000} max={2100} value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="2026" required />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionModal;
