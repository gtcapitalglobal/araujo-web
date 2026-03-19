export function getNextDueDate(currentDue: string, frequency: string): string {
  const date = new Date(currentDue + "T12:00:00");
  switch (frequency) {
    case "semanal":
      date.setDate(date.getDate() + 7);
      break;
    case "mensal":
      date.setMonth(date.getMonth() + 1);
      break;
    case "trimestral":
      date.setMonth(date.getMonth() + 3);
      break;
    case "semestral":
      date.setMonth(date.getMonth() + 6);
      break;
    case "anual":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().split("T")[0];
}

export const frequencyOptions = [
  { key: "semanal", label: "Semanal", monthlyFactor: 4.33 },
  { key: "mensal", label: "Mensal", monthlyFactor: 1 },
  { key: "trimestral", label: "Trimestral", monthlyFactor: 1 / 3 },
  { key: "semestral", label: "Semestral", monthlyFactor: 1 / 6 },
  { key: "anual", label: "Anual", monthlyFactor: 1 / 12 },
];
