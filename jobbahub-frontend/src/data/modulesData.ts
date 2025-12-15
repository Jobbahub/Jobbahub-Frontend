import { IChoiceModule } from '../types';

export const mockModules: IChoiceModule[] = [
  {
    _id: '1',
    id: 101,
    name: 'Advanced React Patterns',
    description: 'Een diepgaande verkenning van component design patterns en state management.',
    shortdescription: 'Verdiep je kennis in React.',
    content: 'Inhoud over hooks, context en performance.',
    studycredit: 15,
    location: 'Breda',
    level: 'Gevorderd',
    tags: [
      { id: 't1', name: 'Frontend', color: 'blue' },
      { id: 't2', name: 'React', color: 'indigo' }
    ],
    image: 'https://placehold.co/600x400/2563eb/ffffff?text=React+Patterns'
  },
  {
    _id: '2',
    id: 102,
    name: 'UX Design Fundamentals',
    description: 'Leer de basisprincipes van User Experience, wireframing en prototyping.',
    shortdescription: 'Basisprincipes van UX.',
    studycredit: 30,
    location: 'Tilburg',
    level: 'Beginner',
    learningoutcomes: 'Kan een wireframe maken in Figma.',
    tags: [
      { id: 't3', name: 'Design', color: 'pink' },
      { id: 't4', name: 'UX', color: 'purple' }
    ],
    image: 'https://placehold.co/600x400/db2777/ffffff?text=UX+Design'
  },
  {
    _id: '3',
    id: 103,
    name: 'Cloud Architecture (AWS)',
    description: 'Introductie tot cloud computing, serverless architecturen en deployment pipelines.',
    studycredit: 15,
    level: 'Expert',
    tags: [
      { id: 't5', name: 'Backend', color: 'yellow' },
      { id: 't6', name: 'Cloud', color: 'orange' }
    ],
    image: 'https://placehold.co/600x400/ca8a04/ffffff?text=AWS+Cloud'
  },
  {
    _id: '4',
    id: 104,
    name: 'Agile & Scrum',
    description: 'Werken in moderne softwareteams volgens de Scrum methodiek en Agile principes.',
    studycredit: 30,
    location: 'Online',
    tags: [
      { id: 't7', name: 'Soft Skills', color: 'green' },
      { id: 't8', name: 'Management', color: 'teal' }
    ],
    image: 'https://placehold.co/600x400/16a34a/ffffff?text=Agile'
  }
];