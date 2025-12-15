export interface ITag {
  id: string;
  name: string;
  color?: string; // Optioneel voor UI styling
}

export interface IChoiceModule {
  _id: string;       // Unieke string ID
  id?: number;       // Optioneel numeriek ID
  name: string;      // Naam van de module
  description: string;
  shortdescription?: string;
  content?: string;
  studycredit: number;
  location?: string;
  level?: string;
  learningoutcomes?: string;
  tags: ITag[];
  image?: string;    // Optioneel: voor de weergave in de app
}