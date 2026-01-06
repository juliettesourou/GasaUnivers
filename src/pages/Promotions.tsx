import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Plus } from 'lucide-react';
import { getAllPromotions, getAllUsers } from '@/lib/db';
import { getPromotions as apiGetPromotions, getStudentsByPromotion as apiGetStudentsByPromotion } from '@/lib/api';
// import { useNavigate } from 'react-router-dom';
import type { Promotion } from '@/lib/db';
import PromotionModal from '@/components/modals/PromotionModal';
import StudentModal from '@/components/modals/StudentModal';
import RecentCredentialsModal from '@/components/modals/RecentCredentialsModal';
import PromotionStudentsModal from '@/components/modals/PromotionStudentsModal';

export const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ id: string; label?: string } | null>(null);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [hasRecentCredentials, setHasRecentCredentials] = useState(false);
  // const navigate = useNavigate();

  const loadPromotions = async () => {
    try {
      // try backend first
      try {
        const promos = await apiGetPromotions();
        // enrich with students count by calling students endpoint per promotion
        const enriched = await Promise.all(promos.map(async (p: any) => {
          try {
            const students = await apiGetStudentsByPromotion(p._id || p.id);
            return { id: p._id || p.id, label: p.label, year: p.year, students: (students || []).length, spaces: p.spaces || 0 };
          } catch (e) {
            return { id: p._id || p.id, label: p.label, year: p.year, students: p.students ?? 0, spaces: p.spaces || 0 };
          }
        }));
        setPromotions(enriched as any);
      } catch (err) {
        // fallback to local DB
        const [all, users] = await Promise.all([getAllPromotions(), getAllUsers()]);
        const counts = users.reduce<Record<string, number>>((acc, u) => {
          if (u.role === 'etudiant' && u.promotion) {
            acc[u.promotion] = (acc[u.promotion] || 0) + 1;
          }
          return acc;
        }, {});
        const enriched = all.map((p) => ({ ...p, students: counts[p.id] ?? p.students ?? 0 }));
        setPromotions(enriched);
      }
    } catch (error) {
      console.error('Failed to load promotions:', error);
    }
  };

  useEffect(() => {
    loadPromotions();
    try { setHasRecentCredentials(!!localStorage.getItem('lastStudentCredentials')); } catch (e) { setHasRecentCredentials(false); }
  }, []);

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Promotions</h1>
          <p className="text-gray-600">Gérer les promotions par année académique</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCredentialsOpen(true)} variant="outline" className="hidden sm:inline-flex" disabled={!hasRecentCredentials}>
            Derniers identifiants
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
          <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
          Ajouter une promotion
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => (
          <Card key={promo.id} className="bg-card text-card-foreground border-gray-200">
              <CardHeader>
                <div className="flex items-baseline justify-between w-full">
                  <div className="flex items-baseline gap-3">
                    <CardTitle className="text-2xl font-heading text-foreground">{promo.label || `Promotion`}</CardTitle>
                    <span className="text-sm text-gray-500">{promo.year}</span>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" strokeWidth={1.5} />
                    Étudiants
                  </span>
                  <span className="font-medium text-foreground">{promo.students}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                    Espaces pédagogiques
                  </span>
                  <span className="font-medium text-foreground">{promo.spaces}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => { setSelectedPromotion({ id: promo.id, label: promo.label }); setIsStudentModalOpen(true); }} className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">Ajouter étudiants</Button>
                <Button variant="outline" onClick={() => { setSelectedPromotion({ id: promo.id, label: promo.label }); setIsViewStudentsOpen(true); }} className="w-full bg-transparent text-foreground border-gray-300 hover:bg-gray-100 hover:text-foreground">Voir étudiants</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PromotionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); loadPromotions(); }} />
      {selectedPromotion && (
        <StudentModal
          isOpen={isStudentModalOpen}
          onClose={() => { setIsStudentModalOpen(false); setSelectedPromotion(null); loadPromotions(); setHasRecentCredentials(!!localStorage.getItem('lastStudentCredentials')); }}
          promotionId={selectedPromotion.id}
          promotionLabel={selectedPromotion.label}
          role="etudiant"
        />
      )}

      {selectedPromotion && (
        <PromotionStudentsModal
          isOpen={isViewStudentsOpen}
          onClose={() => { setIsViewStudentsOpen(false); setSelectedPromotion(null); loadPromotions(); }}
          promotionId={selectedPromotion.id}
          promotionLabel={selectedPromotion.label}
        />
      )}

      <RecentCredentialsModal isOpen={isCredentialsOpen} onClose={() => { setIsCredentialsOpen(false); setHasRecentCredentials(!!localStorage.getItem('lastStudentCredentials')); }} />
    </div>
  );
};
