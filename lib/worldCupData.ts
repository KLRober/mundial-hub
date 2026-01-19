// World Cup 2026 Data - 48 teams in 12 groups (A-L)
// Hosted by USA, Canada, and Mexico
// OFFICIAL GROUPS

export interface WorldCupTeam {
    name: string;
    code: string; // ISO 3166-1 alpha-2 for flags
    group: string;
}

export interface GroupMatch {
    id: string;
    homeTeam: string; // team code
    awayTeam: string; // team code
    group: string;
    matchday: 1 | 2 | 3;
}

// Flag URL helper - uses FlagCDN
export function getFlagUrl(code: string, width: number = 80): string {
    return `https://flagcdn.com/w${width}/${code.toLowerCase()}.webp`;
}

// 48 Teams organized in 12 Groups (A-L) - OFFICIAL DRAW
export const WORLD_CUP_TEAMS: WorldCupTeam[] = [
    // Group A
    { name: 'México', code: 'mx', group: 'A' },
    { name: 'Sudáfrica', code: 'za', group: 'A' },
    { name: 'Corea del Sur', code: 'kr', group: 'A' },
    { name: 'UEFA 4', code: 'eu', group: 'A' }, // TBD - UEFA Playoff

    // Group B
    { name: 'Canadá', code: 'ca', group: 'B' },
    { name: 'UEFA 1', code: 'eu', group: 'B' }, // TBD - UEFA Playoff
    { name: 'Qatar', code: 'qa', group: 'B' },
    { name: 'Suiza', code: 'ch', group: 'B' },

    // Group C
    { name: 'Brasil', code: 'br', group: 'C' },
    { name: 'Marruecos', code: 'ma', group: 'C' },
    { name: 'Haití', code: 'ht', group: 'C' },
    { name: 'Escocia', code: 'gb-sct', group: 'C' },

    // Group D
    { name: 'Estados Unidos', code: 'us', group: 'D' },
    { name: 'Paraguay', code: 'py', group: 'D' },
    { name: 'Australia', code: 'au', group: 'D' },
    { name: 'UEFA 3', code: 'eu', group: 'D' }, // TBD - UEFA Playoff

    // Group E
    { name: 'Alemania', code: 'de', group: 'E' },
    { name: 'Curazao', code: 'cw', group: 'E' },
    { name: 'Costa de Marfil', code: 'ci', group: 'E' },
    { name: 'Ecuador', code: 'ec', group: 'E' },

    // Group F
    { name: 'Países Bajos', code: 'nl', group: 'F' },
    { name: 'Japón', code: 'jp', group: 'F' },
    { name: 'UEFA 2', code: 'eu', group: 'F' }, // TBD - UEFA Playoff
    { name: 'Túnez', code: 'tn', group: 'F' },

    // Group G
    { name: 'Bélgica', code: 'be', group: 'G' },
    { name: 'Egipto', code: 'eg', group: 'G' },
    { name: 'Irán', code: 'ir', group: 'G' },
    { name: 'Nueva Zelanda', code: 'nz', group: 'G' },

    // Group H
    { name: 'España', code: 'es', group: 'H' },
    { name: 'Cabo Verde', code: 'cv', group: 'H' },
    { name: 'Arabia Saudita', code: 'sa', group: 'H' },
    { name: 'Uruguay', code: 'uy', group: 'H' },

    // Group I
    { name: 'Francia', code: 'fr', group: 'I' },
    { name: 'Senegal', code: 'sn', group: 'I' },
    { name: 'FIFA 2', code: 'un', group: 'I' }, // TBD - FIFA Playoff
    { name: 'Noruega', code: 'no', group: 'I' },

    // Group J
    { name: 'Argentina', code: 'ar', group: 'J' },
    { name: 'Argelia', code: 'dz', group: 'J' },
    { name: 'Austria', code: 'at', group: 'J' },
    { name: 'Jordania', code: 'jo', group: 'J' },

    // Group K
    { name: 'Portugal', code: 'pt', group: 'K' },
    { name: 'FIFA 1', code: 'un', group: 'K' }, // TBD - FIFA Playoff
    { name: 'Uzbekistán', code: 'uz', group: 'K' },
    { name: 'Colombia', code: 'co', group: 'K' },

    // Group L
    { name: 'Inglaterra', code: 'gb-eng', group: 'L' },
    { name: 'Croacia', code: 'hr', group: 'L' },
    { name: 'Ghana', code: 'gh', group: 'L' },
    { name: 'Panamá', code: 'pa', group: 'L' },
];

// Group identifiers
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;
export type GroupLetter = typeof GROUPS[number];

// Official Group Seeds (host/top-seeded countries)
export const GROUP_SEEDS: Record<GroupLetter, string> = {
    'A': 'México',
    'B': 'Canadá',
    'C': 'Brasil',
    'D': 'USA',
    'E': 'Alemania',
    'F': 'Países Bajos',
    'G': 'Bélgica',
    'H': 'España',
    'I': 'Francia',
    'J': 'Argentina',
    'K': 'Portugal',
    'L': 'Inglaterra'
};

// Helper to get teams by group
export function getTeamsByGroup(group: string): WorldCupTeam[] {
    return WORLD_CUP_TEAMS.filter(team => team.group === group);
}

// Generate all group stage matches (3 matchdays x 2 matches = 6 matches per group)
// Each team plays against every other team in the group once
export function generateGroupMatches(group: string): GroupMatch[] {
    const teams = getTeamsByGroup(group);
    if (teams.length !== 4) return [];

    // Standard 4-team round-robin schedule
    return [
        // Matchday 1
        { id: `${group}-M1-1`, homeTeam: teams[0].code, awayTeam: teams[1].code, group, matchday: 1 },
        { id: `${group}-M1-2`, homeTeam: teams[2].code, awayTeam: teams[3].code, group, matchday: 1 },
        // Matchday 2
        { id: `${group}-M2-1`, homeTeam: teams[0].code, awayTeam: teams[2].code, group, matchday: 2 },
        { id: `${group}-M2-2`, homeTeam: teams[1].code, awayTeam: teams[3].code, group, matchday: 2 },
        // Matchday 3
        { id: `${group}-M3-1`, homeTeam: teams[0].code, awayTeam: teams[3].code, group, matchday: 3 },
        { id: `${group}-M3-2`, homeTeam: teams[1].code, awayTeam: teams[2].code, group, matchday: 3 },
    ];
}

// Get all group stage matches
export function getAllGroupMatches(): GroupMatch[] {
    return GROUPS.flatMap(group => generateGroupMatches(group));
}

// Get team by code
export function getTeamByCode(code: string): WorldCupTeam | undefined {
    return WORLD_CUP_TEAMS.find(team => team.code === code);
}
