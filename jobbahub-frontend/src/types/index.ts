export interface Module {
  id: string;
  title: string;
  description: string;
  ects: number;
  category: string;
  image?: string; // Optioneel plaatje
}