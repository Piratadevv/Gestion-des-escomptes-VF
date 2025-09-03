import { Escompte, Refinancement } from '../types';

/**
 * Utilitaires pour les calculs financiers précis
 * Utilise des entiers pour éviter les erreurs de précision des nombres flottants
 */

/**
 * Convertit un montant en dirhams vers des centimes (entier)
 */
export function dirhamsVersCentimes(dirhams: number): number {
  if (isNaN(dirhams) || dirhams === null || dirhams === undefined) {
    return 0;
  }
  return Math.round(dirhams * 100);
}

/**
 * Convertit des centimes (entier) vers un montant en dirhams
 */
export function centimesVersDirhams(centimes: number): number {
  if (isNaN(centimes) || centimes === null || centimes === undefined) {
    return 0;
  }
  return centimes / 100;
}

/**
 * Additionne deux montants en dirhams avec précision
 */
export function additionnerMontants(montant1: number, montant2: number): number {
  const centimes1 = dirhamsVersCentimes(montant1);
  const centimes2 = dirhamsVersCentimes(montant2);
  return centimesVersDirhams(centimes1 + centimes2);
}

/**
 * Soustrait deux montants en dirhams avec précision
 */
export function soustraireMontants(montant1: number, montant2: number): number {
  const centimes1 = dirhamsVersCentimes(montant1);
  const centimes2 = dirhamsVersCentimes(montant2);
  return centimesVersDirhams(centimes1 - centimes2);
}

/**
 * Multiplie un montant par un coefficient avec précision
 */
export function multiplierMontant(montant: number, coefficient: number): number {
  const centimes = dirhamsVersCentimes(montant);
  return centimesVersDirhams(Math.round(centimes * coefficient));
}

/**
 * Calcule le cumul total des escomptes
 */
export function calculerCumulTotal(escomptes: Escompte[]): number {
  let cumulCentimes = 0;
  
  for (const escompte of escomptes) {
    cumulCentimes += dirhamsVersCentimes(escompte.montant);
  }
  
  return centimesVersDirhams(cumulCentimes);
}

/**
 * Calcule l'encours restant
 */
export function calculerEncoursRestant(autorisationBancaire: number, cumulTotal: number): number {
  return soustraireMontants(autorisationBancaire, cumulTotal);
}

/**
 * Calcule le pourcentage d'utilisation de l'autorisation bancaire
 */
export function calculerPourcentageUtilisation(cumulTotal: number, autorisationBancaire: number): number {
  if (isNaN(cumulTotal) || isNaN(autorisationBancaire) || autorisationBancaire === 0) return 0;
  
  const pourcentage = (cumulTotal / autorisationBancaire) * 100;
  const result = Math.round(pourcentage * 100) / 100; // Arrondi à 2 décimales
  return isNaN(result) ? 0 : result;
}

/**
 * Vérifie si un montant dépasserait l'autorisation bancaire
 */
export function verifierDepassementAutorisation(
  nouveauMontant: number,
  cumulActuel: number,
  autorisationBancaire: number
): boolean {
  const nouveauCumul = additionnerMontants(cumulActuel, nouveauMontant);
  return nouveauCumul > autorisationBancaire;
}

/**
 * Calcule l'impact d'un nouveau montant sur les totaux
 */
export function calculerImpactNouveauMontant(
  nouveauMontant: number,
  cumulActuel: number,
  autorisationBancaire: number
): {
  nouveauCumul: number;
  nouvelEncours: number;
  nouveauPourcentage: number;
  depassement: boolean;
} {
  const nouveauCumul = additionnerMontants(cumulActuel, nouveauMontant);
  const nouvelEncours = calculerEncoursRestant(autorisationBancaire, nouveauCumul);
  const nouveauPourcentage = calculerPourcentageUtilisation(nouveauCumul, autorisationBancaire);
  const depassement = nouveauCumul > autorisationBancaire;
  
  return {
    nouveauCumul,
    nouvelEncours,
    nouveauPourcentage,
    depassement,
  };
}

/**
 * Formate un montant pour l'affichage
 */
export function formaterMontant(
  montant: number,
  options: {
    devise?: string;
    decimales?: number;
    separateurMilliers?: boolean;
  } = {}
): string {
  const {
    devise = 'DH',
    decimales = 2,
    separateurMilliers = true,
  } = options;
  
  // Handle NaN, null, undefined values
  if (isNaN(montant) || montant === null || montant === undefined) {
    return `0,00 ${devise}`;
  }
  
  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
    useGrouping: separateurMilliers,
  };
  
  const montantFormate = new Intl.NumberFormat('fr-FR', formatOptions).format(montant);
  return `${montantFormate} ${devise}`;
}

/**
 * Formate un pourcentage pour l'affichage
 */
export function formaterPourcentage(
  pourcentage: number,
  decimales: number = 1
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(pourcentage / 100);
}

/**
 * Valide qu'un montant est valide (positif et avec maximum 2 décimales)
 */
export function validerMontant(montant: number): {
  valide: boolean;
  erreurs: string[];
} {
  const erreurs: string[] = [];
  
  if (isNaN(montant)) {
    erreurs.push('Le montant doit être un nombre valide');
  } else {
    if (montant <= 0) {
      erreurs.push('Le montant doit être positif');
    }
    
    // Vérifier le nombre de décimales
    const decimales = (montant.toString().split('.')[1] || '').length;
    if (decimales > 2) {
      erreurs.push('Le montant ne peut avoir plus de 2 décimales');
    }
    
    // Vérifier que le montant n'est pas trop grand
    if (montant > 999999999.99) {
      erreurs.push('Le montant ne peut dépasser 999 999 999,99 DH');
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
  };
}

/**
 * Calcule la moyenne des montants
 */
export function calculerMoyenneMontants(escomptes: Escompte[]): number {
  if (escomptes.length === 0) return 0;
  
  const total = calculerCumulTotal(escomptes);
  return total / escomptes.length;
}

/**
 * Trouve le montant minimum et maximum
 */
export function trouverMinMaxMontants(escomptes: Escompte[]): {
  minimum: number;
  maximum: number;
} {
  if (escomptes.length === 0) {
    return { minimum: 0, maximum: 0 };
  }
  
  let minimum = escomptes[0]?.montant || 0;
  let maximum = escomptes[0]?.montant || 0;
  
  for (const escompte of escomptes) {
    if (escompte.montant < minimum) {
      minimum = escompte.montant;
    }
    if (escompte.montant > maximum) {
      maximum = escompte.montant;
    }
  }
  
  return { minimum, maximum };
}

/**
 * Calcule les statistiques des montants
 */
export function calculerStatistiquesMontants(escomptes: Escompte[]): {
  total: number;
  moyenne: number;
  minimum: number;
  maximum: number;
  nombre: number;
} {
  const total = calculerCumulTotal(escomptes);
  const moyenne = calculerMoyenneMontants(escomptes);
  const { minimum, maximum } = trouverMinMaxMontants(escomptes);
  
  return {
    total,
    moyenne,
    minimum,
    maximum,
    nombre: escomptes.length,
  };
}

export function calculerCumulRefinancements(refinancements: Refinancement[]): number {
  let cumulCentimes = 0;
  for (const r of refinancements) {
    cumulCentimes += dirhamsVersCentimes(r.montantRefinance);
  }
  return centimesVersDirhams(cumulCentimes);
}

export function calculerCumulGlobal(cumulEscomptes: number, cumulRefinancements: number): number {
  return additionnerMontants(cumulEscomptes, cumulRefinancements);
}

export function calculerEncoursRestantGlobal(autorisationBancaire: number, cumulGlobal: number): number {
  return soustraireMontants(autorisationBancaire, cumulGlobal);
}

export function calculerPourcentageUtilisationGlobal(cumulGlobal: number, autorisationBancaire: number): number {
  if (autorisationBancaire === 0) return 0;
  const pourcentage = (cumulGlobal / autorisationBancaire) * 100;
  return Math.round(pourcentage * 100) / 100;
}