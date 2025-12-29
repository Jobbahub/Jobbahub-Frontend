export interface ITag {
  id: string;
  name: string;
  color?: string; // Optioneel voor UI styling
}

export interface IChoiceModule {
  _id: string;
  id: number;
  name: string;
  shortdescription: string;
  description: string;
  content?: string;        
  studycredit: number;
  location?: string;        
  level?: string;           
  learningoutcomes?: string;
  // Let op: In je JSON is dit een string die eruit ziet als een array "['a', 'b']"
  module_tags?: string;   
  tags?: ITag[];  
  available_spots?: number; 
  start_date?: string;      
  estimated_difficulty?: number;
}

export interface IChoiceCustomModule {
  _id: string;
  id: number;
  name: string;
  shortdescription: string;
  description: string;
  content?: string;        
  studycredit: number;
  location?: string;        
  level?: string;           
  learningoutcomes?: string;
  // Let op: In je JSON is dit een string die eruit ziet als een array "['a', 'b']"
  module_tags?: string;   
  tags?: ITag[];  
  available_spots?: number; 
  start_date?: string;      
  estimated_difficulty?: number;
  tags_list?: string;
}