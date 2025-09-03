import { format, parseISO, isValid, startOfDay, endOfDay, addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import fr from 'date-fns/locale/fr';

/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date pour l'affichage
 */
export function formaterDate(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Date invalide';
    }
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Formate une date avec l'heure pour l'affichage
 */
export function formaterDateHeure(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy à HH:mm'
): string {
  return formaterDate(date, formatStr);
}

/**
 * Formate une date de manière relative (il y a X jours, etc.)
 */
export function formaterDateRelative(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Date invalide';
    }
    
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - dateObj.getTime();
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHeures = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffJours > 7) {
      return formaterDate(dateObj);
    } else if (diffJours > 0) {
      return `Il y a ${diffJours} jour${diffJours > 1 ? 's' : ''}`;
    } else if (diffHeures > 0) {
      return `Il y a ${diffHeures} heure${diffHeures > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Convertit une date en format ISO pour l'API
 */
export function dateVersISO(date: Date): string {
  return date.toISOString();
}

/**
 * Convertit une date en format pour input HTML date
 */
export function dateVersInputHTML(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
}

/**
 * Convertit une valeur d'input HTML date vers un objet Date
 */
export function inputHTMLVersDate(value: string): Date | null {
  if (!value) return null;
  
  try {
    const date = parseISO(value + 'T00:00:00');
    return isValid(date) ? date : null;
  } catch (error) {
    return null;
  }
}

/**
 * Valide qu'une date est valide
 */
export function validerDate(date: string | Date): {
  valide: boolean;
  erreurs: string[];
} {
  const erreurs: string[] = [];
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      erreurs.push('La date n\'est pas valide');
    } else {
      const maintenant = new Date();
      const dansCinqAns = addDays(maintenant, 365 * 5);
      const ilYaCinqAns = subDays(maintenant, 365 * 5);
      
      if (dateObj > dansCinqAns) {
        erreurs.push('La date ne peut pas être dans plus de 5 ans');
      }
      
      if (dateObj < ilYaCinqAns) {
        erreurs.push('La date ne peut pas être antérieure à 5 ans');
      }
    }
  } catch (error) {
    erreurs.push('Format de date invalide');
  }
  
  return {
    valide: erreurs.length === 0,
    erreurs,
  };
}

/**
 * Obtient la date du jour au format ISO
 */
export function obtenirDateAujourdhui(): string {
  return dateVersISO(startOfDay(new Date()));
}

/**
 * Obtient les dates de début et fin du mois courant
 */
export function obtenirDebutFinMoisCourant(): {
  debut: string;
  fin: string;
} {
  const maintenant = new Date();
  return {
    debut: dateVersISO(startOfMonth(maintenant)),
    fin: dateVersISO(endOfMonth(maintenant)),
  };
}

/**
 * Obtient les dates de début et fin de l'année courante
 */
export function obtenirDebutFinAnneeCourante(): {
  debut: string;
  fin: string;
} {
  const maintenant = new Date();
  return {
    debut: dateVersISO(startOfYear(maintenant)),
    fin: dateVersISO(endOfYear(maintenant)),
  };
}

/**
 * Obtient les dates pour différentes périodes prédéfinies
 */
export function obtenirPeriodePredéfinie(periode: string): {
  debut: string;
  fin: string;
} | null {
  const maintenant = new Date();
  
  switch (periode) {
    case 'aujourd_hui':
      return {
        debut: dateVersISO(startOfDay(maintenant)),
        fin: dateVersISO(endOfDay(maintenant)),
      };
      
    case '7_derniers_jours':
      return {
        debut: dateVersISO(startOfDay(subDays(maintenant, 6))),
        fin: dateVersISO(endOfDay(maintenant)),
      };
      
    case '30_derniers_jours':
      return {
        debut: dateVersISO(startOfDay(subDays(maintenant, 29))),
        fin: dateVersISO(endOfDay(maintenant)),
      };
      
    case 'mois_courant':
      return obtenirDebutFinMoisCourant();
      
    case 'annee_courante':
      return obtenirDebutFinAnneeCourante();
      
    default:
      return null;
  }
}

/**
 * Compare deux dates (retourne -1, 0, ou 1)
 */
export function comparerDates(date1: string | Date, date2: string | Date): number {
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    if (!isValid(dateObj1) || !isValid(dateObj2)) {
      return 0;
    }
    
    if (dateObj1 < dateObj2) return -1;
    if (dateObj1 > dateObj2) return 1;
    return 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Vérifie si une date est dans une plage donnée
 */
export function estDansPlage(
  date: string | Date,
  debut: string | Date,
  fin: string | Date
): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const debutObj = typeof debut === 'string' ? parseISO(debut) : debut;
    const finObj = typeof fin === 'string' ? parseISO(fin) : fin;
    
    if (!isValid(dateObj) || !isValid(debutObj) || !isValid(finObj)) {
      return false;
    }
    
    return dateObj >= debutObj && dateObj <= finObj;
  } catch (error) {
    return false;
  }
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function calculerNombreJours(
  dateDebut: string | Date,
  dateFin: string | Date
): number {
  try {
    const debutObj = typeof dateDebut === 'string' ? parseISO(dateDebut) : dateDebut;
    const finObj = typeof dateFin === 'string' ? parseISO(dateFin) : dateFin;
    
    if (!isValid(debutObj) || !isValid(finObj)) {
      return 0;
    }
    
    const diffMs = finObj.getTime() - debutObj.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

/**
 * Obtient le nom du mois en français
 */
export function obtenirNomMois(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Mois invalide';
    }
    return format(dateObj, 'MMMM yyyy', { locale: fr });
  } catch (error) {
    return 'Mois invalide';
  }
}

/**
 * Obtient la date actuelle
 */
export function obtenirDateActuelle(): Date {
  return new Date();
}

/**
 * Obtient le début du mois pour une date donnée
 */
export function obtenirDebutMois(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Obtient la fin du mois pour une date donnée
 */
export function obtenirFinMois(date: Date): Date {
  return endOfMonth(date);
}