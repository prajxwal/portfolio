export interface Project {
    link: string;
    text: string;
    image: string;
    category: string;
    year: string;
}

export const projects: Project[] = [
    {
        link: 'https://github.com/prajxwal/hearMD',
        text: 'hearMD',
        image: 'https://picsum.photos/seed/hearmd/600/400',
        category: 'Full Stack',
        year: '2026',
    },
    {
        link: 'https://option-pricing-engine.vercel.app/',
        text: 'Option Pricing Engine',
        image: 'https://picsum.photos/seed/optionprice/600/400',
        category: 'Quant Finance',
        year: '2025',
    },
    {
        link: 'https://wfc-sudoku-solver.vercel.app/',
        text: 'WFC Sudoku Solver',
        image: 'https://picsum.photos/seed/sudoku/600/400',
        category: 'Algorithms',
        year: '2025',
    },
    {
        link: 'https://github.com/prajxwal/WindowsDefenderBypass-csharp',
        text: 'Defender Bypass',
        image: 'https://picsum.photos/seed/defender/600/400',
        category: 'Security',
        year: '2024',
    },
];
