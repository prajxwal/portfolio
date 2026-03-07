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
        image: '/hearmd.png',
        category: 'Full Stack',
        year: '2026',
    },
    {
        link: 'https://option-pricing-engine.vercel.app/',
        text: 'Option Pricing Engine',
        image: '/option.png',
        category: 'Quant Finance',
        year: '2025',
    },
    {
        link: 'https://wfc-sudoku-solver.vercel.app/',
        text: 'WFC Sudoku Solver',
        image: '/wfc.png',
        category: 'Algorithms',
        year: '2025',
    },
    {
        link: 'https://github.com/prajxwal/WindowsDefenderBypass-csharp',
        text: 'Defender Bypass',
        image: '/windef.png',
        category: 'Security',
        year: '2024',
    },
];
