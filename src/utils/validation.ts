import { z } from 'zod';
import { EscompteSchema, ConfigurationSchema, RefinancementSchema } from '../types';
import { validerMontant } from './calculations';
import { validerDate } from './dates';

/**
 * Utilitaires de validation pour les formulaires et données
 */

/**
 * Valide les données d'un escompte
 */
export function validerEscompte(data: any): {
  valide: boolean;
  erreurs: Record<string, string[]>;
  donnees?: any;
} {
  try {
    const donnees = EscompteSchema.parse(data);
    return {
      valide: true,
      erreurs: {},
      donnees,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const erreurs: Record<string, string[]> = {};
      
      error.errors.forEach((err: any) => {
        const champ = err.path.join('.');
        if (!erreurs[champ]) {
          erreurs[champ] = [];
        }
        erreurs[champ]?.push(err.message);
      });
      
      return {
        valide: false,
        erreurs,
      };
    }
    
    return {
      valide: false,
      erreurs: { general: ['Erreur de validation inconnue'] },
    };
  }
}

/**
 * Valide les données de configuration
 */
export function validerConfiguration(data: any): {
  valide: boolean;
  erreurs: Record<string, string[]>;
  donnees?: any;
} {
  try {
    const donnees = ConfigurationSchema.parse(data);
    return {
      valide: true,
      erreurs: {},
      donnees,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const erreurs: Record<string, string[]> = {};
      
      error.errors.forEach((err: any) => {
        const champ = err.path.join('.');
        if (!erreurs[champ]) {
          erreurs[champ] = [];
        }
        erreurs[champ]?.push(err.message);
      });
      
      return {
        valide: false,
        erreurs,
      };
    }
    
    return {
      valide: false,
      erreurs: { general: ['Erreur de validation inconnue'] },
    };
  }
}

/**
 * Valide un libellé d'escompte
 */
export function validerLibelle(libelle: string): {
  valide: boolean;
  erreurs: string[];
} {
  const erreurs: string[] = [];
  
  if (!libelle || libelle.trim().length === 0) {
    erreurs.push('Le libellé est obligatoire');
  } else {
    if (libelle.trim().length < 3) {
      erreurs.push('Le libellé doit contenir au moins 3 caractères');
    }
    
    if (libelle.length > 255) {
      erreurs.push('Le libellé ne peut pas dépasser 255 caractères');
    }
    
    // Vérifier les caractères interdits
    const caracteresInterdits = /[<>"'&]/;
    if (caracteresInterdits.test(libelle)) {
      erreurs.push('Le libellé contient des caractères interdits (< > " \' & )');
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
  };
}

/**
 * Valide un montant d'escompte avec contexte métier
 */
export function validerMontantEscompte(
  montant: number,
  cumulActuel: number,
  autorisationBancaire: number
): {
  valide: boolean;
  erreurs: string[];
  avertissements: string[];
} {
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  
  // Validation de base du montant
  const validationBase = validerMontant(montant);
  if (!validationBase.valide) {
    erreurs.push(...validationBase.erreurs);
  }
  
  if (validationBase.valide) {
    // Vérifier le dépassement d'autorisation
    const nouveauCumul = cumulActuel + montant;
    if (nouveauCumul > autorisationBancaire) {
      erreurs.push(
        `Ce montant dépasserait l'autorisation bancaire (${nouveauCumul.toFixed(2)} DH > ${autorisationBancaire.toFixed(2)} DH)`
      );
    }
    
    // Avertissements pour les montants élevés
    const pourcentageUtilisation = (nouveauCumul / autorisationBancaire) * 100;
    if (pourcentageUtilisation > 90 && nouveauCumul <= autorisationBancaire) {
      avertissements.push(
        `Ce montant porterait l'utilisation à ${pourcentageUtilisation.toFixed(1)}% de l'autorisation`
      );
    }
    
    if (montant > autorisationBancaire * 0.1) {
      avertissements.push(
        'Ce montant représente plus de 10% de l\'autorisation bancaire'
      );
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
  };
}

/**
 * Valide une date de remise d'escompte
 */
export function validerDateRemise(date: string): {
  valide: boolean;
  erreurs: string[];
  avertissements: string[];
} {
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  
  // Validation de base de la date
  const validationBase = validerDate(date);
  if (!validationBase.valide) {
    erreurs.push(...validationBase.erreurs);
  }
  
  if (validationBase.valide) {
    const dateRemise = new Date(date);
    const maintenant = new Date();
    const demain = new Date(maintenant);
    demain.setDate(demain.getDate() + 1);
    
    // Vérifier que la date n'est pas dans le futur
    if (dateRemise > demain) {
      erreurs.push('La date de remise ne peut pas être dans le futur');
    }
    
    // Avertissement pour les dates anciennes
    const ilYaUnMois = new Date(maintenant);
    ilYaUnMois.setMonth(ilYaUnMois.getMonth() - 1);
    
    if (dateRemise < ilYaUnMois) {
      avertissements.push('Cette date de remise est antérieure à un mois');
    }
    
    // Avertissement pour les week-ends
    const jourSemaine = dateRemise.getDay();
    if (jourSemaine === 0 || jourSemaine === 6) {
      avertissements.push('Cette date correspond à un week-end');
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
  };
}

/**
 * Valide une autorisation bancaire
 */
export function validerAutorisationBancaire(
  autorisation: number,
  cumulActuel?: number
): {
  valide: boolean;
  erreurs: string[];
  avertissements: string[];
} {
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  
  // Validation de base du montant
  const validationBase = validerMontant(autorisation);
  if (!validationBase.valide) {
    erreurs.push(...validationBase.erreurs);
  }
  
  if (validationBase.valide) {
    // Vérifier que l'autorisation n'est pas trop faible
    if (autorisation < 1000) {
      avertissements.push('Une autorisation inférieure à 1 000 DH est inhabituelle');
    }
    
    // Vérifier que l'autorisation n'est pas trop élevée
    if (autorisation > 10000000) {
      avertissements.push('Une autorisation supérieure à 10 millions de dirhams est inhabituelle');
    }
    
    // Vérifier la cohérence avec le cumul actuel
    if (cumulActuel !== undefined && autorisation < cumulActuel) {
      erreurs.push(
        `L'autorisation ne peut pas être inférieure au cumul actuel (${cumulActuel.toFixed(2)} DH)`
      );
    }
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
  };
}

// ----------------------
// Validations Refinancement
// ----------------------

/**
 * Valide les données d'un refinancement
 */
export function validerRefinancement(data: any): {
  valide: boolean;
  erreurs: Record<string, string[]>;
  donnees?: any;
} {
  try {
    const donnees = RefinancementSchema.parse(data);
    return {
      valide: true,
      erreurs: {},
      donnees,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const erreurs: Record<string, string[]> = {};
      error.errors.forEach((err: any) => {
        const champ = err.path.join('.');
        if (!erreurs[champ]) {
          erreurs[champ] = [];
        }
        erreurs[champ]?.push(err.message);
      });
      return {
        valide: false,
        erreurs,
      };
    }
    return {
      valide: false,
      erreurs: { general: ['Erreur de validation inconnue'] },
    };
  }
}

/**
 * Valide un montant de refinancement avec contexte métier
 */
export function validerMontantRefinancement(
  montantRefinance: number,
  cumulActuel: number,
  autorisationBancaire: number
): {
  valide: boolean;
  erreurs: string[];
  avertissements: string[];
} {
  const erreurs: string[] = [];
  const avertissements: string[] = [];

  const validationBase = validerMontant(montantRefinance);
  if (!validationBase.valide) {
    erreurs.push(...validationBase.erreurs);
  }

  if (validationBase.valide) {
    const nouveauCumul = cumulActuel + montantRefinance;
    if (nouveauCumul > autorisationBancaire) {
      erreurs.push(
        `Ce montant refinancé dépasserait l'autorisation bancaire (${nouveauCumul.toFixed(2)} DH > ${autorisationBancaire.toFixed(2)} DH)`
      );
    }

    const pourcentageUtilisation = (nouveauCumul / autorisationBancaire) * 100;
    if (pourcentageUtilisation > 90 && nouveauCumul <= autorisationBancaire) {
      avertissements.push(
        `Ce montant porterait l'utilisation à ${pourcentageUtilisation.toFixed(1)}% de l'autorisation`
      );
    }

    if (montantRefinance > autorisationBancaire * 0.1) {
      avertissements.push(
        'Ce montant représente plus de 10% de l\'autorisation bancaire'
      );
    }
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
  };
}

/**
 * Valide une date de refinancement
 */
export function validerDateRefinancement(date: string): {
  valide: boolean;
  erreurs: string[];
  avertissements: string[];
} {
  const erreurs: string[] = [];
  const avertissements: string[] = [];

  const validationBase = validerDate(date);
  if (!validationBase.valide) {
    erreurs.push(...validationBase.erreurs);
  }

  if (validationBase.valide) {
    const d = new Date(date);
    const maintenant = new Date();
    const demain = new Date(maintenant);
    demain.setDate(demain.getDate() + 1);

    if (d > demain) {
      erreurs.push('La date de refinancement ne peut pas être dans le futur');
    }

    const ilYaUnMois = new Date(maintenant);
    ilYaUnMois.setMonth(ilYaUnMois.getMonth() - 1);
    if (d < ilYaUnMois) {
      avertissements.push('Cette date de refinancement est antérieure à un mois');
    }

    const jourSemaine = d.getDay();
    if (jourSemaine === 0 || jourSemaine === 6) {
      avertissements.push('Cette date correspond à un week-end');
    }
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
    avertissements,
  };
}