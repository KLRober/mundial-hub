import type { Match, Team } from '@/types/database';

// Mock teams data
const mockTeams: Record<string, Team> = {
    ARG: {
        id: 'arg',
        name: 'Argentina',
        code: 'ARG',
        flag_url: '🇦🇷',
        group: 'A',
    },
    MEX: {
        id: 'mex',
        name: 'México',
        code: 'MEX',
        flag_url: '🇲🇽',
        group: 'A',
    },
    BRA: {
        id: 'bra',
        name: 'Brasil',
        code: 'BRA',
        flag_url: '🇧🇷',
        group: 'B',
    },
    USA: {
        id: 'usa',
        name: 'Estados Unidos',
        code: 'USA',
        flag_url: '🇺🇸',
        group: 'B',
    },
    ESP: {
        id: 'esp',
        name: 'España',
        code: 'ESP',
        flag_url: '🇪🇸',
        group: 'C',
    },
    GER: {
        id: 'ger',
        name: 'Alemania',
        code: 'GER',
        flag_url: '🇩🇪',
        group: 'C',
    },
};

// Mock matches for today
const mockMatches: Match[] = [
    {
        id: 'match-1',
        home_team: mockTeams.ARG,
        away_team: mockTeams.MEX,
        home_score: null,
        away_score: null,
        match_date: new Date().toISOString().split('T')[0],
        match_time: '16:00',
        venue: 'Estadio Azteca',
        city: 'Ciudad de México',
        stage: 'group',
        status: 'scheduled',
        group: 'A',
    },
    {
        id: 'match-2',
        home_team: mockTeams.BRA,
        away_team: mockTeams.USA,
        home_score: 2,
        away_score: 1,
        match_date: new Date().toISOString().split('T')[0],
        match_time: '13:00',
        venue: 'MetLife Stadium',
        city: 'Nueva Jersey',
        stage: 'group',
        status: 'finished',
        group: 'B',
    },
    {
        id: 'match-3',
        home_team: mockTeams.ESP,
        away_team: mockTeams.GER,
        home_score: 1,
        away_score: 1,
        match_date: new Date().toISOString().split('T')[0],
        match_time: '19:00',
        venue: 'SoFi Stadium',
        city: 'Los Ángeles',
        stage: 'group',
        status: 'live',
        group: 'C',
    },
];

export async function getTodayMatches(): Promise<Match[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMatches;
}

export async function getMatchById(id: string): Promise<Match | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockMatches.find((m) => m.id === id) || null;
}

export async function getUpcomingMatches(): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMatches.filter((m) => m.status === 'scheduled');
}
